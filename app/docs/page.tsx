"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  BookOpen, 
  ChevronRight, 
  Users, 
  FolderLock, 
  CheckSquare, 
  Bell, 
  LayoutTemplate, 
  Target, 
  BarChart4, 
  Settings, 
  HelpCircle,
  Code,
  LogIn,
  UserPlus,
  ShieldCheck,
  Trash2,
  LogOut
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"

const sections = [
  { 
    id: "getting-started", 
    title: "Getting Started", 
    icon: <BookOpen className="size-4" />,
    content: (
      <div className="space-y-6">
        <h2 className="text-3xl font-black italic">🚀 Getting Started</h2>
        <p className="text-muted-foreground">Welcome to <strong>Morx</strong>! We've built an advanced reports and statistics platform designed for modern teams who want to move fast with precision.</p>
        
        <div className="rounded-2xl overflow-hidden border bg-muted/20">
          <img src="/Morx/Home.png" alt="Morx Dashboard" className="w-full object-cover shadow-2xl" />
        </div>

        <div className="p-4 bg-primary/5 rounded-xl border-l-4 border-primary">
          <p className="font-bold">The Morx Vision</p>
          <p className="text-sm mt-1">Our platform isn't just about checkboxes; it me-seeks to provide a complete ecosystem where data-driven decisions meet seamless collaboration.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <button 
            onClick={() => {
              const element = document.getElementById('auth-scroll');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
              const authSection = document.querySelector('[data-section-id="auth"]');
              if (authSection) (authSection as HTMLElement).click();
            }}
            className="p-4 border rounded-xl bg-background hover:border-primary/50 transition-colors text-left group"
          >
             <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:bg-primary group-hover:text-white transition-colors">1</div>
             <p className="text-sm font-bold">Create Account</p>
             <p className="text-xs text-muted-foreground">Sign up with your academic or professional email to join the network.</p>
             <p className="text-[10px] text-primary mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Learn how <ChevronRight className="size-2" /></p>
          </button>
          <button 
            onClick={() => {
              const teamSection = document.querySelector('[data-section-id="teams"]');
              if (teamSection) (teamSection as HTMLElement).click();
            }}
            className="p-4 border rounded-xl bg-background hover:border-primary/50 transition-colors text-left group"
          >
             <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:bg-primary group-hover:text-white transition-colors">2</div>
             <p className="text-sm font-bold">Join or Create Team</p>
             <p className="text-xs text-muted-foreground">Start your own department or join an existing workforce.</p>
             <p className="text-[10px] text-primary mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Explore teams <ChevronRight className="size-2" /></p>
          </button>
        </div>
      </div>
    )
  },
  { 
    id: "auth", 
    title: "Authentication", 
    icon: <LogIn className="size-4" />,
    content: (
      <div id="auth-scroll" className="space-y-6">
        <h2 className="text-3xl font-black italic">🔐 Authentication</h2>
        <p className="text-muted-foreground">Getting started with Morx is simple. Whether you're creating a new account or signing back in, we've optimized the flow for speed and security.</p>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="signup" className="border-none">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                 <div className="size-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500"><UserPlus className="size-4" /></div>
                 <div className="text-left">
                    <p className="text-sm font-bold">Sign Up Workflow</p>
                    <p className="text-xs text-muted-foreground font-normal">A multi-step process to set up your professional profile.</p>
                 </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6 pt-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Step 1</Badge>
                      <p className="text-sm font-bold">Basic Information</p>
                    </div>
                    <div className="rounded-xl overflow-hidden border bg-muted/20">
                      <img src="/Morx/sign up 1.png" alt="Sign Up Step 1" className="w-full object-cover" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Step 2</Badge>
                      <p className="text-sm font-bold">Email Verification</p>
                    </div>
                    <div className="rounded-xl overflow-hidden border bg-muted/20">
                      <img src="/Morx/sign up 2.png" alt="Sign Up Step 2" className="w-full object-cover" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Step 3</Badge>
                      <p className="text-sm font-bold">Academic Details</p>
                    </div>
                    <div className="rounded-xl overflow-hidden border bg-muted/20">
                      <img src="/Morx/sign up 3.png" alt="Sign Up Step 3" className="w-full object-cover" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Step 4</Badge>
                      <p className="text-sm font-bold">Security & Password</p>
                    </div>
                    <div className="rounded-xl overflow-hidden border bg-muted/20">
                      <img src="/Morx/sign up 4.png" alt="Sign Up Step 4" className="w-full object-cover" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Step 5</Badge>
                      <p className="text-sm font-bold">Finalizing Profile</p>
                    </div>
                    <div className="rounded-xl overflow-hidden border bg-muted/20">
                      <img src="/Morx/sign up 5.png" alt="Sign Up Step 5" className="w-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="signin" className="border-none mt-4">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                 <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500"><LogIn className="size-4" /></div>
                 <div className="text-left">
                    <p className="text-sm font-bold">Sign In Process</p>
                    <p className="text-xs text-muted-foreground font-normal">Quick access to your workspace via traditional or social login.</p>
                 </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6 pt-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Email Login</p>
                    <div className="rounded-xl overflow-hidden border bg-muted/20">
                      <img src="/Morx/login.png" alt="Login Page" className="w-full object-cover" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Social Provider</p>
                    <div className="rounded-xl overflow-hidden border bg-muted/20">
                      <img src="/Morx/login 2.png" alt="Login Provider" className="w-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    )
  },
  { 
    id: "profile", 
    title: "User Profile", 
    icon: <Users className="size-4" />,
    content: (
      <div className="space-y-6">
        <h2 className="text-3xl font-black italic">👤 Your Identity</h2>
        <p className="text-muted-foreground">Your profile is your professional hub in Morx. Manage your skills, track your participations, and showcase your contributions.</p>
        
        <div className="rounded-2xl overflow-hidden border bg-muted/20">
          <img src="/Morx/Profile.png" alt="User Profile" className="w-full object-cover" />
        </div>

        <div className="space-y-4">
           <h3 className="text-xl font-bold italic">Key Features:</h3>
           <ul className="grid gap-3">
              <li className="flex items-start gap-3">
                 <div className="size-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mt-0.5"><CheckSquare className="size-3" /></div>
                 <div>
                    <p className="text-sm font-bold">Profile Sync</p>
                    <p className="text-xs text-muted-foreground">Automatic synchronization with your Google account for a seamless experience.</p>
                 </div>
              </li>
              <li className="flex items-start gap-3">
                 <div className="size-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mt-0.5"><CheckSquare className="size-3" /></div>
                 <div>
                    <p className="text-sm font-bold">Activity Tracking</p>
                    <p className="text-xs text-muted-foreground">Keep an eye on your assigned tasks and progress across all teams.</p>
                 </div>
              </li>
           </ul>
        </div>
      </div>
    )
  },
  { 
    id: "teams", 
    title: "Teams & Workforce", 
    icon: <Users className="size-4" />,
    content: (
      <div className="space-y-6">
        <h2 className="text-3xl font-black italic">👥 Team Power</h2>
        <p className="text-muted-foreground">Collaborate effectively by grouping members into functional teams and departments.</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl overflow-hidden border bg-muted/20">
            <img src="/Morx/Team.png" alt="Team Overview" className="w-full h-full object-cover" />
          </div>
          <div className="rounded-xl overflow-hidden border bg-muted/20">
            <img src="/Morx/team 2.png" alt="Team Dashboard" className="w-full h-full object-cover" />
          </div>
        </div>

        <h3 className="text-xl font-bold mt-4">Public vs Private Teams</h3>
        <p className="text-sm text-muted-foreground">Public teams can be requested by anyone, while private teams require a direct invitation from the owner or admin.</p>
        
        <div className="rounded-2xl overflow-hidden border bg-muted/20 border-primary/20">
          <img src="/Morx/public teams.png" alt="Public Teams Explorer" className="w-full object-cover" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          <div className="p-5 bg-destructive/5 border border-destructive/10 rounded-2xl space-y-3">
             <div className="flex items-center gap-2 text-destructive">
                <Trash2 className="size-4" />
                <p className="text-sm font-bold">Team Dissolution</p>
             </div>
             <p className="text-xs text-muted-foreground">Only owners can completely delete a team. This action is irreversible.</p>
             <div className="rounded-xl overflow-hidden border border-destructive/20">
                <img src="/Morx/delete team.png" alt="Delete Team" className="w-full" />
             </div>
          </div>
          <div className="p-5 bg-orange-500/5 border border-orange-500/10 rounded-2xl space-y-3">
             <div className="flex items-center gap-2 text-orange-500">
                <LogOut className="size-4" />
                <p className="text-sm font-bold">Leaving a Team</p>
             </div>
             <p className="text-xs text-muted-foreground">Members can leave teams at any time, but will lose access to team resources.</p>
             <div className="rounded-xl overflow-hidden border border-orange-500/20">
                <img src="/Morx/leave team.png" alt="Leave Team" className="w-full" />
             </div>
          </div>
        </div>

        <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl mt-4">
           <div className="flex items-center gap-2 text-primary mb-3">
              <ShieldCheck className="size-4" />
              <p className="text-sm font-bold">Permissions: Admin vs Owner</p>
           </div>
           <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="space-y-2">
                 <p className="text-xs text-muted-foreground">While both have high privileges, Owners have the ultimate control over team existence and billing, whereas Admins focus on management and moderation.</p>
                 <ul className="space-y-1">
                    <li className="text-[11px] flex items-center gap-1.5"><div className="size-1 rounded-full bg-primary" /> Owners: Delete team, transfer ownership.</li>
                    <li className="text-[11px] flex items-center gap-1.5"><div className="size-1 rounded-full bg-primary" /> Admins: Manage members, edit tasks, moderate content.</li>
                 </ul>
              </div>
              <div className="rounded-xl overflow-hidden border border-primary/20 bg-background">
                 <img src="/Morx/admin vs owner.png" alt="Admin vs Owner comparison" className="w-full" />
              </div>
           </div>
        </div>
      </div>
    )
  },
  { 
    id: "marketplace", 
    title: "Marketplace", 
    icon: <Users className="size-4" />,
    content: (
      <div className="space-y-6">
        <h2 className="text-3xl font-black italic">🏆 Talent Marketplace</h2>
        <p className="text-muted-foreground">Need developers, designers, or writers? Find the best talent directly within our internal ecosystem.</p>
        
        <div className="rounded-2xl overflow-hidden border bg-muted/20">
          <img src="/Morx/Talent.png" alt="Talent Marketplace" className="w-full object-cover" />
        </div>

        <div className="p-6 bg-secondary/5 rounded-2xl border border-secondary/20">
           <h4 className="font-bold flex items-center gap-2 mb-2"><HelpCircle className="size-4" /> Smart Recruitment</h4>
           <ol className="list-decimal list-inside text-sm space-y-2 text-muted-foreground">
              <li>Search for talent based on their department or skills.</li>
              <li>View their profile and previous project contributions.</li>
              <li>Send a formal invitation to join your specific team and role.</li>
           </ol>
        </div>
      </div>
    )
  },
  { 
    id: "invites", 
    title: "Invites & Requests", 
    icon: <Bell className="size-4" />,
    content: (
      <div className="space-y-6">
        <h2 className="text-3xl font-black italic">📨 Managing Invitations</h2>
        <p className="text-muted-foreground">Track all incoming requests and outgoing invitations in one centralized place.</p>
        
        <div className="grid gap-4">
          <div className="rounded-2xl overflow-hidden border bg-muted/20">
            <img src="/Morx/invite 1.png" alt="Invitation View" className="w-full object-cover" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="rounded-xl overflow-hidden border bg-muted/20">
               <img src="/Morx/request.png" alt="Team Requests" className="w-full h-full object-cover" />
             </div>
             <div className="rounded-xl overflow-hidden border bg-muted/20">
               <img src="/Morx/request to pub team.png" alt="Public Team Requests" className="w-full h-full object-cover" />
             </div>
          </div>
        </div>
      </div>
    )
  },
  { 
    id: "tasks", 
    title: "Project Workflow", 
    icon: <CheckSquare className="size-4" />,
    content: (
      <div className="space-y-6">
        <h2 className="text-3xl font-black italic">🛠️ Managing Workflows</h2>
        <p className="text-muted-foreground">Our project management tool is built for depth. From simple checklists to complex building blocks.</p>
        
        <div className="rounded-2xl overflow-hidden border bg-muted/20">
          <img src="/Morx/tasks.png" alt="Tasks Board" className="w-full object-cover" />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
           <div className="rounded-xl overflow-hidden border bg-muted/10 p-2">
              <p className="text-[10px] font-bold text-center mb-1 uppercase">Assign Users</p>
              <img src="/Morx/assign users.png" alt="Assigning Users" className="w-full rounded" />
           </div>
           <div className="rounded-xl overflow-hidden border bg-muted/10 p-2">
              <p className="text-[10px] font-bold text-center mb-1 uppercase">Move & Organize</p>
              <img src="/Morx/move task.png" alt="Moving Tasks" className="w-full rounded" />
           </div>
           <div className="rounded-xl overflow-hidden border bg-muted/10 p-2">
              <p className="text-[10px] font-bold text-center mb-1 uppercase">Advanced Edit</p>
              <img src="/Morx/edit task.png" alt="Editing Tasks" className="w-full rounded" />
           </div>
        </div>

        <div className="rounded-2xl overflow-hidden border bg-muted/20">
          <p className="p-3 text-xs font-bold bg-muted/30">Strategic Planning View</p>
          <img src="/Morx/plan.png" alt="Strategic Plan" className="w-full object-cover" />
        </div>

        <div className="p-5 bg-destructive/5 border border-destructive/10 rounded-2xl mt-6 space-y-3">
           <div className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-4" />
              <p className="text-sm font-bold">Project Deletion</p>
           </div>
           <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                 <p className="text-xs text-muted-foreground mb-4">Deleting a project will permanently remove all associated tasks, comments, and reports. Ensure you have backed up any necessary data before proceeding.</p>
                 <div className="p-3 bg-background rounded-lg border border-destructive/20 text-[10px] italic">
                    Note: Only the project owner or a team administrator can perform this action.
                 </div>
              </div>
              <div className="shrink-0 w-full md:w-64 rounded-xl overflow-hidden border border-destructive/20 bg-background">
                 <img src="/Morx/delete project.png" alt="Delete Project" className="w-full" />
              </div>
           </div>
        </div>
      </div>
    )
  },
  { 
    id: "templates", 
    title: "Automated Templates", 
    icon: <LayoutTemplate className="size-4" />,
    content: (
      <div className="space-y-6">
        <h2 className="text-3xl font-black italic">📋 Smart Templates</h2>
        <p className="text-muted-foreground">Don't start from scratch. Use templates to replicate proven workflows in seconds.</p>
        
        <div className="rounded-2xl overflow-hidden border bg-muted/20">
          <img src="/Morx/templates.png" alt="Template Library" className="w-full object-cover" />
        </div>

        <p className="text-sm">Our template library includes pre-built structures for Software Development, UI/UX Research, Marketing Campaigns, and academic projects.</p>
      </div>
    )
  },
  { 
    id: "analytics", 
    title: "Analytics", 
    icon: <BarChart4 className="size-4" />,
    content: (
      <div className="space-y-6">
        <h2 className="text-3xl font-black italic">📊 Powerful Analytics</h2>
        <p className="text-muted-foreground">Visualize your success. Our reporting engine turns task data into beautiful, actionable charts.</p>
        
        <div className="rounded-2xl overflow-hidden border bg-muted/20">
          <img src="/Morx/reports.png" alt="Reporting Dashboard" className="w-full object-cover" />
        </div>

        <div className="p-4 bg-muted/40 rounded-xl">
           <p className="text-xs italic text-muted-foreground">"Data matures your team. Morx matures your data."</p>
        </div>
      </div>
    )
  },
  { 
    id: "notifications", 
    title: "Notifications", 
    icon: <Bell className="size-4" />,
    content: (
      <div className="space-y-6">
        <h2 className="text-3xl font-black italic">🔔 Real-time Alerts</h2>
        <p className="text-muted-foreground">Never miss a deadline or a team update with our multi-channel notification system.</p>
        
        <div className="space-y-4">
           <div className="rounded-xl border p-4 flex items-center justify-center bg-muted/5 max-w-sm mx-auto">
              <img src="/Morx/Notification 1.png" alt="Notification Menu" className="max-w-full shadow-sm rounded-lg" />
           </div>
           <div className="rounded-2xl border overflow-hidden bg-muted/5">
              <img src="/Morx/Notification 2.png" alt="Notifications Panel" className="w-full object-cover" />
           </div>
        </div>
      </div>
    )
  },
  { 
    id: "customization", 
    title: "Themes", 
    icon: <Settings className="size-4" />,
    content: (
      <div className="space-y-6">
        <h2 className="text-3xl font-black italic">🎨 Customization</h2>
        <p className="text-muted-foreground">Make Morx yours. Choose from multiple curated color themes that suit your aesthetic.</p>
        
        <div className="rounded-2xl overflow-hidden border bg-muted/20">
          <img src="/Morx/themes.png" alt="Theme Selector" className="w-full object-cover" />
        </div>

        <div className="flex gap-4">
           {['Mint', 'Indigo', 'Ocean', 'Amber'].map(color => (
              <div key={color} className="flex-1 text-center py-2 rounded-lg border text-[10px] font-bold">
                 {color}
              </div>
           ))}
        </div>
      </div>
    )
  }
]

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("getting-started")

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 border-t relative">
        <div className="container px-4 md:px-6 py-12 flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0 space-y-8">
             <div className="space-y-1">
                <h4 className="px-4 text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-4">Documentation</h4>
                <nav className="space-y-1">
                   {sections.map((section) => (
                     <button
                        key={section.id}
                        data-section-id={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeSection === section.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
                     >
                        {section.icon}
                        {section.title}
                     </button>
                   ))}
                </nav>
             </div>

             <div className="p-4 rounded-2xl bg-muted/40 border space-y-4">
                <div className="size-10 rounded-xl bg-background flex items-center justify-center border shadow-sm"><Code className="size-5 text-primary" /></div>
                <div className="space-y-1">
                   <p className="text-sm font-bold">API Access</p>
                   <p className="text-xs text-muted-foreground">Want to build on Top of Morx? Explore our API reference guide.</p>
                </div>
                <Link href="/api" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                   View API Specs <ChevronRight className="size-3" />
                </Link>
             </div>
          </aside>

          {/* Content Area */}
          <div className="flex-1 max-w-4xl min-h-[600px] border-l md:pl-12">
             <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
             >
                {sections.find(s => s.id === activeSection)?.content}
             </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function Rocket(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3" />
      <path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5" />
    </svg>
  )
}

function Badge({ children, variant = "default", className = "" }: any) {
   const styles = variant === "outline" ? "border text-foreground" : "bg-primary text-primary-foreground";
   return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${styles} ${className}`}>{children}</span>
}

import Link from "next/link"
