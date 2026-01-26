"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Search, Users, Star, MessageSquare, Briefcase, Filter, X } from "lucide-react"
import { DEPARTMENT_NAMES } from "@/lib/constants/subjects"
import { toast } from "sonner"

export default function TalentMarketplace() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [talent, setTalent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [myTeams, setMyTeams] = useState<any[]>([])
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [skillFilter, setSkillFilter] = useState("")

  // Invitation state
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [selectedTeam, setSelectedTeam] = useState<string>("")
  const [inviteMessage, setInviteMessage] = useState("")
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [sendingInvite, setSendingInvite] = useState(false)

  useEffect(() => {
    const storedSession = localStorage.getItem('student_session')
    if (storedSession) {
      const userData = JSON.parse(storedSession)
      const normalizedUser = {
        ...userData,
        auth_user_id: userData.auth_user_id || userData.id
      }
      setUser(normalizedUser)
      fetchMyTeams(normalizedUser.auth_user_id)
    }
    fetchTalent()
  }, [])

  const fetchTalent = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/recruitment/talent')
      const result = await res.json()
      if (result.success) {
        setTalent(result.data)
      }
    } catch (error) {
      console.error('Error fetching talent:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyTeams = async (authUserId: string) => {
    try {
      const res = await fetch('/api/teams')
      const result = await res.json()
      if (result.success) {
        // Only teams where I am owner or admin
        const manageableTeams = result.data.filter((t: any) => t.role === 'owner' || t.role === 'admin')
        setMyTeams(manageableTeams)
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    }
  }

  const handleSendInvite = async () => {
    if (!selectedTeam || !selectedUser || !user) return

    try {
      setSendingInvite(true)
      const res = await fetch('/api/recruitment/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id: parseInt(selectedTeam),
          target_auth_user_id: selectedUser.auth_user_id,
          inviter_id: user.auth_user_id,
          message: inviteMessage
        })
      })

      const result = await res.json()
      if (result.success) {
        toast.success("Invitation sent successfully!")
        setIsInviteOpen(false)
        setInviteMessage("")
        setSelectedTeam("")
      } else {
        toast.error(result.error || "Failed to send invitation")
      }
    } catch (error) {
      console.error('Error sending invite:', error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setSendingInvite(false)
    }
  }

  const filteredTalent = talent.filter(item => {
    const matchesSearch = searchQuery === "" || 
      `${item.first_name} ${item.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.bio && item.bio.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesDepartment = departmentFilter === "all" || item.department === departmentFilter
    
    const matchesSkill = skillFilter === "" || 
      (item.skills && item.skills.some((s: string) => s.toLowerCase().includes(skillFilter.toLowerCase())))

    return matchesSearch && matchesDepartment && matchesSkill && item.auth_user_id !== user?.auth_user_id
  })

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-3 rock-salt text-primary">Talent Marketplace</h1>
              <p className="text-muted-foreground text-lg text-arabic">Find talent and build your dream team</p>
            </div>
            <div className="flex items-center gap-3">
               <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/5 text-primary border-primary/20">
                {talent.length>1 ? talent.length-1 : talent.length} Members Available
               </Badge>
            </div>
          </div>

          {/* Filters Bar */}
          <Card className="mb-8 border-primary/10 shadow-sm bg-background">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search name or bio..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger>
                      <Filter className="mr-2 size-4 text-muted-foreground" />
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                      {Object.entries(DEPARTMENT_NAMES).map(([code, name]) => (
                        <SelectItem key={code} value={code}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input 
                    placeholder="Filter by skill (e.g. React)..." 
                    className="pl-9"
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {(searchQuery || departmentFilter !== "all" || skillFilter) && (
                    <Button variant="ghost" className="h-10 text-muted-foreground" onClick={() => {
                        setSearchQuery("");
                        setDepartmentFilter("all");
                        setSkillFilter("");
                    }}>
                      <X className="mr-2 size-4" /> Reset
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Discovering talented individuals...</p>
            </div>
          ) : filteredTalent.length === 0 ? (
            <div className="text-center py-20">
              <Users className="size-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No talent found</h3>
              <p className="text-muted-foreground">Try adjusting your filters to find more members.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTalent.map((member) => (
                <Card key={member.auth_user_id} className="group hover:shadow-xl transition-all duration-300 border-primary/5 hover:border-primary/20 overflow-hidden flex flex-col ">
                  <div className="h-2 bg-gradient-to-r from-primary/40 to-primary/10" />
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="size-16 border-2 border-primary/10">
                        <AvatarImage src={member.profile_image} />
                        <AvatarFallback className="text-xl bg-primary/5 text-primary">
                          {member.first_name?.[0]}{member.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl font-bold truncate group-hover:text-primary transition-colors">
                          {member.first_name} {member.last_name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1 text-sm font-medium text-primary/80">
                          <Star className="size-3 fill-primary/20" /> 
                          {(member.department && DEPARTMENT_NAMES[member.department]) || member.department || "General"} • Level {member.study_level || "?"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3 italic min-h-[60px]">
                      "{member.bio || "No bio provided. This member is ready for new challenges!"}"
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {member.skills && Array.isArray(member.skills) && member.skills.length > 0 ? (
                        member.skills.slice(0, 6).map((skill: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-[10px] uppercase font-bold tracking-wider py-0.5 px-2 bg-muted/50 border-none">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No specific skills listed</span>
                      )}
                      {member.skills?.length > 6 && <Badge variant="outline" className="text-[10px]">+{member.skills.length - 6} more</Badge>}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 pb-6 pr-6">
                    <div className="flex w-full items-center justify-end gap-3">
                       
                       {myTeams.length > 0 && (
                         <Dialog open={isInviteOpen && selectedUser?.auth_user_id === member.auth_user_id} onOpenChange={(open) => {
                           setIsInviteOpen(open);
                           if (open) setSelectedUser(member);
                           else setSelectedUser(null);
                         }}>
                           <DialogTrigger asChild>
                             <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-md">
                               Invite to Team
                             </Button>
                           </DialogTrigger>
                           <DialogContent>
                             <DialogHeader>
                               <DialogTitle>Invite {member.first_name} to your Team</DialogTitle>
                               <DialogDescription>
                                 Choose one of your teams to send an invitation to this user.
                               </DialogDescription>
                             </DialogHeader>
                             <div className="space-y-4 py-4">
                               <div className="space-y-2">
                                 <Label>Select Team</Label>
                                 <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                                   <SelectTrigger>
                                     <SelectValue placeholder="Choose a team..." />
                                   </SelectTrigger>
                                   <SelectContent>
                                     {myTeams.map((team) => (
                                       <SelectItem key={team.team_id} value={team.team_id.toString()}>
                                         {team.team_name} ({team.role})
                                       </SelectItem>
                                     ))}
                                   </SelectContent>
                                 </Select>
                               </div>
                               <div className="space-y-2">
                                 <Label>Invitation Message (Optional)</Label>
                                 <Textarea 
                                   placeholder="Hi! We saw your profile and we'd love to have you on our team..."
                                   value={inviteMessage}
                                   onChange={(e) => setInviteMessage(e.target.value)}
                                   className="min-h-[100px]"
                                 />
                               </div>
                             </div>
                             <DialogFooter>
                               <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
                               <Button onClick={handleSendInvite} disabled={!selectedTeam || sendingInvite}>
                                 {sendingInvite ? "Sending..." : "Send Invitation"}
                               </Button>
                             </DialogFooter>
                           </DialogContent>
                         </Dialog>
                       )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>{children}</label>
}
