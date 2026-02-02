"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { PlanAvatar } from "@/components/ui/plan-avatar"
import { Search, Users, Star, MessageSquare, Briefcase, Filter, X, ExternalLink } from "lucide-react"
import { DEPARTMENT_NAMES } from "@/lib/constants/subjects"
import { toast } from "sonner"

// Social Link Icons
const GithubIcon = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
)

const LinkedInIcon = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.736-.9 10.125-5.864 10.125-11.854z"/>
  </svg>
)

const WhatsAppIcon = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
)

export default function TalentMarketplace() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [talent, setTalent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [myTeams, setMyTeams] = useState<any[]>([])
  
  // WhatsApp dialog state
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false)
  const [selectedMemberForWhatsapp, setSelectedMemberForWhatsapp] = useState<any>(null)
  const [whatsappMessage, setWhatsappMessage] = useState("")
  
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
               <Badge variant="outline" className="px-4 py-1.5 text-sm bg-primary/10 text-primary border-primary/30 backdrop-blur-sm shadow-sm font-bold">
                {filteredTalent.length} {filteredTalent.length === 1 ? 'Member' : 'Members'} Available
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
            <div data-tutorial="talent-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTalent.map((member) => (
                <Card key={member.auth_user_id} className="group hover:shadow-xl transition-all duration-300 border-primary/5 hover:border-primary/20 overflow-hidden flex flex-col ">
                  <div className="h-2 bg-gradient-to-r from-primary/40 to-primary/10" />
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <PlanAvatar
                        src={member.profile_image}
                        alt={member.first_name || ''}
                        plan={member.plan}
                        fallback={
                          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-bold">
                            {member.first_name?.[0]}{member.last_name?.[0]}
                          </div>
                        }
                        size="xl"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl font-bold truncate group-hover:text-primary transition-colors">
                            {member.first_name} {member.last_name}
                          </CardTitle>
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0 ${
                              member.plan === 'enterprise' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                              member.plan === 'professional' ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' :
                              member.plan === 'starter' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
                              'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                            }`}
                          >
                            {member.plan === 'enterprise' ? 'Enterprise' : 
                             member.plan === 'professional' ? 'Pro' : 
                             member.plan === 'starter' ? 'Starter' : 'Free'}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-1 mt-1 text-sm font-medium text-primary/80">
                          <Star className="size-3 fill-primary/20" /> 
                          {(member.department && DEPARTMENT_NAMES[member.department]) || member.department || "General"} • Level {member.study_level || "?"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-5">
                    <div className="relative">
                      <p className="text-sm text-muted-foreground line-clamp-3 italic min-h-[60px] leading-relaxed">
                        "{member.bio || "No bio provided. This member is ready for new challenges!"}"
                      </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-1">Top Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                        {member.skills && Array.isArray(member.skills) && member.skills.length > 0 ? (
                            member.skills.slice(0, 5).map((skill: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-[10px] uppercase font-bold tracking-wider py-0.5 px-2 bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
                                {skill}
                            </Badge>
                            ))
                        ) : (
                            <span className="text-xs text-muted-foreground/60 italic px-1">No specific skills listed</span>
                        )}
                        {member.skills?.length > 5 && (
                            <Badge variant="outline" className="text-[10px] text-primary font-bold border-none">
                            +{member.skills.length - 5} MORE
                            </Badge>
                        )}
                        </div>
                    </div>
                    
                    {/* Social Links */}
                    {member.links && (member.links.github || member.links.linkedin || member.links.facebook || member.links.whatsapp) && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-1">Connect</p>
                        <div className="flex items-center gap-2">
                          {member.links.github && (
                            <a
                              href={member.links.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-all"
                              title="GitHub"
                            >
                              <GithubIcon />
                            </a>
                          )}
                          {member.links.linkedin && (
                            <a
                              href={member.links.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full bg-muted hover:bg-[#0077B5]/10 hover:text-[#0077B5] transition-all"
                              title="LinkedIn"
                            >
                              <LinkedInIcon />
                            </a>
                          )}
                          {member.links.facebook && (
                            <a
                              href={member.links.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full bg-muted hover:bg-[#1877F2]/10 hover:text-[#1877F2] transition-all"
                              title="Facebook"
                            >
                              <FacebookIcon />
                            </a>
                          )}
                          {member.links.whatsapp && (
                            <button
                              onClick={() => {
                                setSelectedMemberForWhatsapp(member)
                                setWhatsappMessage(`Hi ${member.first_name}! I found your profile on Morx and would like to connect with you.`)
                                setWhatsappDialogOpen(true)
                              }}
                              className="p-2 rounded-full bg-muted hover:bg-[#25D366]/10 hover:text-[#25D366] transition-all"
                              title="WhatsApp"
                            >
                              <WhatsAppIcon />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
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
                             <Button size="sm" className="bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-[0_4px_14px_0_rgba(0,186,124,0.39)] transition-all duration-300 font-bold px-6">
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
        
        {/* WhatsApp Message Dialog */}
        <Dialog open={whatsappDialogOpen} onOpenChange={setWhatsappDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-[#25D366]/10">
                  <WhatsAppIcon />
                </div>
                Message {selectedMemberForWhatsapp?.first_name} on WhatsApp
              </DialogTitle>
              <DialogDescription>
                Compose your message before opening WhatsApp
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Your Message</Label>
                <Textarea 
                  placeholder="Write your message..."
                  value={whatsappMessage}
                  onChange={(e) => setWhatsappMessage(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Clicking "Open WhatsApp" will open the WhatsApp app or web with your pre-filled message.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setWhatsappDialogOpen(false)}>Cancel</Button>
              <Button 
                className="bg-[#25D366] hover:bg-[#128C7E] text-white"
                onClick={() => {
                  if (selectedMemberForWhatsapp?.links?.whatsapp) {
                    // Clean the phone number (remove spaces, dashes, etc.)
                    const phoneNumber = selectedMemberForWhatsapp.links.whatsapp.replace(/[\s-()]/g, '').replace(/^\+/, '')
                    const encodedMessage = encodeURIComponent(whatsappMessage)
                    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank')
                    setWhatsappDialogOpen(false)
                  }
                }}
              >
                <WhatsAppIcon />
                <span className="ml-2">Open WhatsApp</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>{children}</label>
}
