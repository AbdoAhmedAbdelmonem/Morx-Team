"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Trash2, Crown, Shield, User, Globe, Lock, Check, X, Copy, LogOut, Users, Settings2, GraduationCap, MoreVertical } from "lucide-react"
import { FCDS_SUBJECTS, TEAM_PURPOSES } from "@/lib/constants/subjects"

export default function TeamSettingsPage() {
  const router = useRouter()
  const params = useParams()
  const teamUrl = params.teamUrl as string

  const [user, setUser] = useState<any>(null)
  const [team, setTeam] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [joinRequests, setJoinRequests] = useState<any[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
  const [isUpdatingDescription, setIsUpdatingDescription] = useState(false)
  const [editDescription, setEditDescription] = useState("")
  
  // Specialized fields
  const [teamType, setTeamType] = useState<'basic' | 'determinated'>('basic')
  const [purpose, setPurpose] = useState("")
  const [subject, setSubject] = useState("")
  const [isUpdatingSpecialized, setIsUpdatingSpecialized] = useState(false)

  useEffect(() => {
    const storedSession = localStorage.getItem('student_session')
    if (storedSession) {
      const userData = JSON.parse(storedSession)
      // Normalize user object to ensure auth_user_id exists
      setUser({
        ...userData,
        auth_user_id: userData.auth_user_id || userData.id
      })
    }
  }, [])

  useEffect(() => {
    if (user?.auth_user_id) {
      fetchTeam()
      fetchMembers()
      fetchJoinRequests()
    }
  }, [teamUrl, user])

  const fetchTeam = async () => {
    try {
      const res = await fetch(`/api/teams/${teamUrl}`)
      const result = await res.json()
      
      if (result.success) {
        setTeam(result.data)
        setEditDescription(result.data.description || "")
        setTeamType(result.data.team_type || 'basic')
        setPurpose(result.data.purpose || "")
        setSubject(result.data.subject || "")
      }
    } catch (error) {
      console.error('Error fetching team:', error)
    }
  }

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/teams/${teamUrl}/members`)
      const result = await res.json()
      
      if (result.success) {
        setMembers(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchJoinRequests = async () => {
    try {
      const res = await fetch(`/api/teams/${teamUrl}/requests`)
      const result = await res.json()
      
      if (result.success) {
        const requests = result.data || []
        setJoinRequests(requests)
        setPendingCount(requests.filter((r: any) => r.status === 'pending').length)
      }
    } catch (error) {
      console.error('Error fetching join requests:', error)
    }
  }

  const handleRemoveMember = async (userId: number, userName: string) => {
    if (!confirm(`Remove ${userName} from the team?`)) return
    
    try {
      const res = await fetch(`/api/teams/${teamUrl}/members?target_auth_user_id=${userId}`, {
        method: 'DELETE'
      })
      
      const result = await res.json()
      
      if (result.success) {
        fetchMembers()
      } else {
        alert(result.error || 'Failed to remove member')
      }
    } catch (error) {
      console.error('Error removing member:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const handleChangeRole = async (userId: number, newRole: string) => {
    try {
      const res = await fetch(`/api/teams/${teamUrl}/members`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          auth_user_id: userId, 
          new_role: newRole,
          requester_id: user?.auth_user_id 
        })
      })
      
      const result = await res.json()
      
      if (result.success) {
        fetchMembers()
      } else {
        alert(result.error || 'Failed to change role')
      }
    } catch (error) {
      console.error('Error changing role:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const handleToggleVisibility = async () => {
    if (!team) return
    setIsUpdatingVisibility(true)
    
    try {
      const res = await fetch(`/api/teams/${teamUrl}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_user_id: user?.auth_user_id,
          is_public: !team.is_public
        })
      })
      
      const result = await res.json()
      
      if (result.success) {
        setTeam({ ...team, is_public: !team.is_public })
      } else {
        alert(result.error || 'Failed to update visibility')
      }
    } catch (error) {
      console.error('Error updating visibility:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsUpdatingVisibility(false)
    }
  }

  const handleUpdateDescription = async () => {
    if (!team) return
    setIsUpdatingDescription(true)
    
    try {
      const res = await fetch(`/api/teams/${teamUrl}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_user_id: user?.auth_user_id,
          description: editDescription
        })
      })
      
      const result = await res.json()
      
      if (result.success) {
        setTeam({ ...team, description: editDescription })
        alert('Description updated successfully')
      } else {
        alert(result.error || 'Failed to update description')
      }
    } catch (error) {
      console.error('Error updating description:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsUpdatingDescription(false)
    }
  }

  const handleUpdateSpecialized = async () => {
    if (!team) return
    setIsUpdatingSpecialized(true)
    
    try {
      const res = await fetch(`/api/teams/${teamUrl}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_user_id: user?.auth_user_id,
          team_type: teamType,
          purpose: purpose || "",
          subject: subject || "",
          tags: subject ? [subject, purpose] : (purpose ? [purpose] : [])
        })
      })
      
      const result = await res.json()
      
      if (result.success) {
        setTeam({ ...team, team_type: teamType, purpose, subject })
        alert('Specialized settings updated successfully')
      } else {
        alert(result.error || 'Failed to update specialized settings')
      }
    } catch (error) {
      console.error('Error updating specialized settings:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsUpdatingSpecialized(false)
    }
  }

  const handleRequestAction = async (requestId: number, action: 'approve' | 'decline') => {
    try {
      const res = await fetch(`/api/teams/${teamUrl}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_user_id: user?.auth_user_id,
          request_id: requestId,
          action
        })
      })
      
      const result = await res.json()
      
      if (result.success) {
        fetchJoinRequests()
        if (action === 'approve') {
          fetchMembers()
        }
      } else {
        alert(result.error || `Failed to ${action} request`)
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error)
      alert('An error occurred. Please try again.')
    }
  }

  const handleLeaveTeam = async () => {
    try {
      if (!user?.auth_user_id) return
      const res = await fetch(`/api/teams/${teamUrl}/members?target_auth_user_id=${user.auth_user_id}`, {
        method: 'DELETE'
      })
      
      const result = await res.json()
      
      if (result.success) {
        router.push('/teams')
      } else {
        alert(result.error || 'Failed to leave team')
      }
    } catch (error) {
      console.error('Error leaving team:', error)
      alert('An error occurred. Please try again.')
    }
    setIsLeaveDialogOpen(false)
  }

  const copyInviteLink = async () => {
    const link = `${window.location.origin}/teams/join/${teamUrl}`
    await navigator.clipboard.writeText(link)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const getRoleIcon = (role: string) => {
    if (role === 'owner') return <Crown className="size-4 text-yellow-500" />
    if (role === 'admin') return <Shield className="size-4 text-blue-500" />
    return <User className="size-4 text-gray-500" />
  }

  const getRoleBadgeColor = (role: string) => {
    if (role === 'owner') return "bg-yellow-100 text-yellow-800"
    if (role === 'admin') return "bg-blue-100 text-blue-800"
    return "bg-gray-100 text-gray-800"
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const isOwnerOrAdmin = team?.role === 'owner' || team?.role === 'admin'
  const isOwner = team?.role === 'owner'
  const pendingRequests = joinRequests.filter(r => r.status === 'pending')
  const currentUserMember = members.find(m => m.auth_user_id === user?.auth_user_id)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 bg-background">
        <div className="container px-4 md:px-6 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => router.push(`/teams/${teamUrl}`)}
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to Team
            </Button>
            
            <h1 className="text-3xl font-bold tracking-tight mb-2">Team Settings</h1>
            <p className="text-muted-foreground">
              Manage {team?.team_name}
            </p>
          </div>

          <div className="space-y-6 bg-background" >
            {/* Team Details Card - Admin/Owner Only */}
            {isOwnerOrAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle>Team Details</CardTitle>
                  <CardDescription>
                    Update your team's name and description
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teamName">Team Name</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="teamName"
                        value={team?.team_name || ""}
                        onChange={(e) => setTeam({ ...team, team_name: e.target.value })}
                        placeholder="Team Name"
                      />
                      <Button 
                        onClick={() => {
                          if (!team?.team_name.trim()) return;
                          console.log('[Teams Settings] Updating team name:', team.team_name);
                          fetch(`/api/teams/${teamUrl}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              auth_user_id: user?.auth_user_id,
                              team_name: team.team_name
                            })
                          }).then(res => res.json()).then(res => {
                            if (res.success) {
                              alert('Team name updated');
                            } else {
                              console.error('[Teams Settings] Update name error:', res.error);
                              alert(res.error || 'Failed to update team name');
                            }
                          }).catch(err => {
                            console.error('[Teams Settings] Network error updating name:', err);
                            alert('Network error. Please try again.');
                          });
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Team Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your team..."
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="h-32 resize-none"
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleUpdateDescription}
                        disabled={isUpdatingDescription}
                      >
                        Update Description
                      </Button>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Settings2 className="size-4" />
                      Specialized Configuration
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Team Type</Label>
                        <Select value={teamType} onValueChange={(val: any) => setTeamType(val)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic Team</SelectItem>
                            <SelectItem value="determinated">Determinated Team</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {teamType === 'determinated' && (
                        <div className="space-y-2">
                          <Label>Purpose</Label>
                          <Select value={purpose} onValueChange={setPurpose}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select purpose" />
                            </SelectTrigger>
                            <SelectContent>
                              {TEAM_PURPOSES.map(p => {
                                const Icon = p.icon;
                                return (
                                  <SelectItem key={p.id} value={p.id}>
                                    <div className="flex items-center gap-2">
                                      <Icon className="size-4" />
                                      {p.label}
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {teamType === 'determinated' && purpose === 'fcds' && (
                        <div className="space-y-2 md:col-span-2">
                          <Label className="flex items-center gap-2">
                            <GraduationCap className="size-4" />
                            Academic Subject
                          </Label>
                          <Select value={subject} onValueChange={setSubject}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a subject..." />
                            </SelectTrigger>
                            <SelectContent>
                              {(() => {
                                const level = user?.study_level ? Number(user.study_level) : null;
                                let dept = user?.department;

                                // Handle 'AI' as an alias for 'IS' (Intelligent Systems)
                                if (dept === 'AI') dept = 'IS';

                                if (!level || !FCDS_SUBJECTS[level]) {
                                  return <SelectItem value="Other">Other</SelectItem>;
                                }

                                const subjectsByDept = FCDS_SUBJECTS[level];
                                const relevantSubjects: string[] = [];

                                if (subjectsByDept["General"]) {
                                  relevantSubjects.push(...subjectsByDept["General"]);
                                }

                                if (dept && dept !== "General" && subjectsByDept[dept]) {
                                  relevantSubjects.push(...subjectsByDept[dept]);
                                }

                                if (relevantSubjects.length === 0) {
                                  return <SelectItem value="Other">Other</SelectItem>;
                                }

                                return relevantSubjects.map((s) => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
                                ));
                              })()}
                            </SelectContent>
                          </Select>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Available subjects based on your Level {user?.study_level || '?'} {user?.department || ''}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button 
                        variant="secondary"
                        onClick={handleUpdateSpecialized}
                        disabled={isUpdatingSpecialized}
                      >
                        Save Specialized Settings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Team Visibility Card - Admin/Owner Only */}
            {isOwnerOrAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {team?.is_public ? <Globe className="size-5 text-green-500" /> : <Lock className="size-5 text-orange-500" />}
                    Team Visibility
                  </CardTitle>
                  <CardDescription>
                    {team?.is_public 
                      ? "This team is public. Anyone can find and request to join."
                      : "This team is private. Only people with invite link can request to join."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="visibility">Public Team</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow anyone to discover and request to join this team
                      </p>
                    </div>
                    <Switch
                      id="visibility"
                      checked={team?.is_public || false}
                      onCheckedChange={handleToggleVisibility}
                      disabled={isUpdatingVisibility}
                    />
                  </div>
                  
                  {/* Invite Link */}
                  <div className="pt-4 border-t">
                    <Label className="mb-2 block">Invite Link</Label>
                    <div className="flex gap-2">
                      <Input 
                        readOnly 
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/teams/join/${teamUrl}`}
                        className="font-mono text-sm"
                      />
                      <Button variant="outline" size="icon" onClick={copyInviteLink}>
                        {linkCopied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Share this link to invite people to request joining your team
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pending Join Requests Card - Admin/Owner Only */}
            {isOwnerOrAdmin && pendingCount > 0 && (
              <Card className="border-primary ring-2 ring-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      Pending Join Requests
                      <Badge className="bg-primary text-primary-foreground animate-pulse">
                        {pendingCount}
                      </Badge>
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Review and manage requests from users who want to join this team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <div key={request.request_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-10">
                            {request.user?.profile_image && (
                              <AvatarImage src={request.user.profile_image} alt={request.user.first_name || 'User'} />
                            )}
                            <AvatarFallback>
                              {request.user?.first_name?.[0]}{request.user?.last_name?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {request.user?.first_name} {request.user?.last_name || ''}
                            </p>
                            <p className="text-sm text-muted-foreground">{request.user?.email}</p>
                            {request.message && (
                              <p className="text-sm text-muted-foreground italic mt-1">"{request.message}"</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRequestAction(request.request_id, 'decline')}
                          >
                            <X className="size-4 mr-1" />
                            Decline
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleRequestAction(request.request_id, 'approve')}
                          >
                            <Check className="size-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Team Members Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="size-5" />
                      Team Members
                    </CardTitle>
                    <CardDescription>{members.length} members</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.map((member) => (
                    <div key={member.auth_user_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <Avatar className="size-10 shrink-0">
                          {member.profile_image && (
                            <AvatarImage src={member.profile_image} alt={member.first_name} />
                          )}
                          <AvatarFallback>
                            {member.first_name?.[0]}{member.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium flex items-center gap-2 truncate">
                            {member.first_name} {member.last_name}
                            {member.auth_user_id === user?.auth_user_id && (
                              <Badge variant="outline" className="text-xs shrink-0">You</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {member.email}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <Badge className={getRoleBadgeColor(member.role)}>
                          <span className="flex items-center gap-1">
                            {getRoleIcon(member.role)}
                            {member.role}
                          </span>
                        </Badge>

                        {/* Actions Dropdown - Only for non-owners and not self */}
                        {isOwnerOrAdmin && member.role !== 'owner' && member.auth_user_id !== user?.auth_user_id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="size-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(member.email)}
                              >
                                <Copy className="mr-2 size-4" />
                                Copy Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              
                              {/* Role Management - Owner Only */}
                              {isOwner && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleChangeRole(member.auth_user_id, member.role === 'admin' ? 'member' : 'admin')}
                                  >
                                    {member.role === 'admin' ? (
                                      <>
                                        <User className="mr-2 size-4" />
                                        Demote to Member
                                      </>
                                    ) : (
                                      <>
                                        <Shield className="mr-2 size-4" />
                                        Promote to Admin
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}

                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => handleRemoveMember(member.auth_user_id, `${member.first_name}${member.last_name ? ' ' + member.last_name : ''}`)}
                              >
                                <Trash2 className="mr-2 size-4" />
                                Remove Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone - Leave Team */}
            {currentUserMember && currentUserMember.role !== 'owner' && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  <CardDescription>
                    Actions here cannot be undone
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Leave Team</p>
                      <p className="text-sm text-muted-foreground">
                        You will lose access to all projects and tasks in this team
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      onClick={() => setIsLeaveDialogOpen(true)}
                    >
                      <LogOut className="mr-2 size-4" />
                      Leave Team
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Leave Team Confirmation Dialog */}
      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Team?</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave <strong>{team?.team_name}</strong>? You will lose access to all projects and tasks. You'll need to request to join again if you change your mind.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLeaveTeam}>
              Leave Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
