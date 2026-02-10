"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle, Users, FolderKanban, Calendar, FileText, BarChart3, PieChart, Activity, Sparkles, Wand2, Brain, Zap, ChevronRight } from "lucide-react"
import { PlanAvatar } from "@/components/ui/plan-avatar"
import { ChartCard } from "@/components/chart-card"
import { StatsCard } from "@/components/stats-card"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

const Typewriter = ({ text, delay = 0.03 }: { text: string; delay?: number }) => {
  const characters = text.split("");
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: delay,
          },
        },
      }}
      className="whitespace-pre-wrap font-sans"
    >
      {characters.map((char, index) => (
        <motion.span
          key={index}
          variants={{
            hidden: { opacity: 0, display: "none" },
            visible: { opacity: 1, display: "inline" },
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default function TeamReportsPage() {
  const router = useRouter()
  const params = useParams()
  const teamUrl = params.teamUrl as string

  const [user, setUser] = useState<any>(null)
  const [team, setTeam] = useState<any>(null)
  const [reportData, setReportData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("30") // days
  const [selectedProject, setSelectedProject] = useState("all")

  useEffect(() => {
    const storedSession = localStorage.getItem('student_session')
    if (storedSession) {
      const userData = JSON.parse(storedSession)
      setUser({
        ...userData,
        auth_user_id: userData.auth_user_id || userData.id
      })
    }
  }, [])

  useEffect(() => {
    if (user?.auth_user_id && teamUrl) {
      fetchTeamData()
      fetchReportData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, teamUrl])

  useEffect(() => {
    if (user?.auth_user_id && teamUrl) {
      fetchReportData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, selectedProject])

  const fetchTeamData = async () => {
    try {
      const res = await fetch(`/api/teams/${teamUrl}`)
      const result = await res.json()
      if (result.success) {
        setTeam(result.data)
      }
    } catch (error) {
      console.error('Error fetching team:', error)
    }
  }

  const fetchReportData = async () => {
    if (!user?.auth_user_id) return
    
    try {
      const res = await fetch(`/api/teams/${teamUrl}/reports?period=${selectedPeriod}&project=${selectedProject}`)
      const result = await res.json()

      if (result.success) {
        setReportData(result.data)
      } else {
        console.error('Report API error:', result.error)
        toast.error(result.error || 'Failed to load reports')
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
      toast.error('Failed to load reports. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const generateReport = async (format: 'pdf' | 'csv') => {
    if (!user?.auth_user_id || !reportData) return

    try {
      const res = await fetch(`/api/teams/${teamUrl}/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_user_id: user.auth_user_id,
          period: selectedPeriod,
          project: selectedProject,
          format
        })
      })

      const result = await res.json()
      if (result.success) {
        // Download the report
        window.open(result.data.download_url, '_blank')
        toast.success('Report generated successfully')
      } else {
        toast.error(result.error || 'Failed to generate report')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    }
  }

  const exportReport = () => {
    if (!reportData) return

    // Create CSV content
    let csvContent = "Team Progress Report\n\n"
    csvContent += `Team: ${team.team_name}\n`
    csvContent += `Period: Last ${selectedPeriod} days\n`
    csvContent += `Generated: ${new Date().toLocaleString()}\n\n`
    
    csvContent += "=== Overview ===\n"
    csvContent += `Total Projects: ${reportData.overview.total_projects}\n`
    csvContent += `Total Tasks: ${reportData.overview.total_tasks}\n`
    csvContent += `Completed Tasks: ${reportData.overview.completed_tasks}\n`
    csvContent += `In Progress: ${reportData.overview.in_progress_tasks}\n`
    csvContent += `Overdue Tasks: ${reportData.overview.overdue_tasks}\n`
    csvContent += `Completion Rate: ${reportData.overview.completion_rate}%\n\n`
    
    csvContent += "=== Team Members Performance ===\n"
    csvContent += "Name,Assigned Tasks,Completed Tasks,Completion Rate\n"
    reportData.member_performance.forEach((member: any) => {
      csvContent += `${member.name},${member.assigned_tasks},${member.completed_tasks},${member.completion_rate}%\n`
    })
    
    csvContent += "\n=== Project Status ===\n"
    csvContent += "Project,Total Tasks,Completed,In Progress,Todo,Overdue\n"
    reportData.project_stats.forEach((proj: any) => {
      csvContent += `${proj.project_name},${proj.total_tasks},${proj.completed},${proj.in_progress},${proj.todo},${proj.overdue}\n`
    })

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `team-report-${team.team_name}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportJSON = () => {
    if (!reportData) return

    // Create comprehensive JSON report with AI-generated insights
    const jsonReport = {
      metadata: {
        team_name: team.team_name,
        team_url: teamUrl,
        report_period: `Last ${selectedPeriod} days`,
        generated_at: new Date().toISOString(),
        generated_by: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Unknown User'
      },
      executive_summary: generateExecutiveSummary(),
      overview: {
        total_projects: reportData.overview.total_projects,
        total_tasks: reportData.overview.total_tasks,
        completed_tasks: reportData.overview.completed_tasks,
        in_progress_tasks: reportData.overview.in_progress_tasks,
        todo_tasks: reportData.overview.todo_tasks,
        overdue_tasks: reportData.overview.overdue_tasks,
        completion_rate: reportData.overview.completion_rate,
        completion_trend: reportData.overview.completion_trend
      },
      task_distribution: {
        completed: {
          count: reportData.overview.completed_tasks,
          percentage: reportData.overview.total_tasks > 0 
            ? ((reportData.overview.completed_tasks / reportData.overview.total_tasks) * 100).toFixed(1)
            : "0.0"
        },
        in_progress: {
          count: reportData.overview.in_progress_tasks,
          percentage: reportData.overview.total_tasks > 0
            ? ((reportData.overview.in_progress_tasks / reportData.overview.total_tasks) * 100).toFixed(1)
            : "0.0"
        },
        todo: {
          count: reportData.overview.todo_tasks,
          percentage: reportData.overview.total_tasks > 0
            ? ((reportData.overview.todo_tasks / reportData.overview.total_tasks) * 100).toFixed(1)
            : "0.0"
        },
        overdue: {
          count: reportData.overview.overdue_tasks,
          percentage: reportData.overview.total_tasks > 0
            ? ((reportData.overview.overdue_tasks / reportData.overview.total_tasks) * 100).toFixed(1)
            : "0.0"
        }
      },
      projects: reportData.project_stats.map((proj: any) => ({
        project_id: proj.project_id,
        project_name: proj.project_name,
        total_tasks: proj.total_tasks,
        completed: proj.completed,
        in_progress: proj.in_progress,
        todo: proj.todo,
        overdue: proj.overdue,
        completion_rate: proj.total_tasks > 0 ? ((proj.completed / proj.total_tasks) * 100).toFixed(1) : "0.0",
        status: proj.overdue > 0 ? 'At Risk' : proj.completed === proj.total_tasks ? 'Completed' : 'On Track'
      })),
      team_members: reportData.member_performance.map((member: any) => ({
        auth_user_id: member.auth_user_id,
        name: member.name,
        role: member.role,
        assigned_tasks: member.assigned_tasks,
        completed_tasks: member.completed_tasks,
        completion_rate: member.completion_rate,
        performance_level: member.completion_rate >= 80 ? 'Excellent' : 
                          member.completion_rate >= 60 ? 'Good' : 
                          member.completion_rate >= 40 ? 'Average' : 'Needs Improvement'
      })),
      recent_activity: reportData.recent_activity,
      insights: generateInsights()
    }

    // Download JSON
    const blob = new Blob([JSON.stringify(jsonReport, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `team-report-${team.team_name}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getExecutiveSummaryData = () => {
    if (!reportData) return null
    
    const completionRate = reportData.overview.completion_rate || 0
    const totalTasks = reportData.overview.total_tasks
    const overdueCount = reportData.overview.overdue_tasks
    const trend = reportData.overview.completion_trend || 0
    
    // Top performer
    const topPerformer = reportData.member_performance.reduce((top: any, member: any) => 
      member.completion_rate > (top?.completion_rate || 0) ? member : top, null)

    return {
      title: `Team "${team.team_name}" Performance Analytics`,
      period: `Last ${selectedPeriod} Days`,
      overview: {
        text: `The team is managing ${totalTasks} tasks across ${reportData.overview.total_projects} projects with a ${completionRate}% completion rate.`,
        trend: trend,
        trendText: trend > 0 
          ? `Performance has improved by ${trend}% compared to the previous period, showing positive momentum.`
          : trend < 0 
            ? `Performance has declined by ${Math.abs(trend)}% compared to the previous period, requiring attention.`
            : `Performance remains stable compared to the previous period.`
      },
      breakdown: [
        { label: 'Completed', value: reportData.overview.completed_tasks, percentage: completionRate, color: 'text-green-600', bg: 'bg-green-500', icon: CheckCircle2 },
        { label: 'In Progress', value: reportData.overview.in_progress_tasks, color: 'text-blue-600', bg: 'bg-blue-500', icon: Clock },
        { label: 'To Do', value: reportData.overview.todo_tasks, color: 'text-gray-600', bg: 'bg-gray-500', icon: Activity }
      ],
      alert: overdueCount > 0 
        ? { type: 'critical', text: `${overdueCount} tasks are overdue and require immediate action.`, icon: AlertCircle }
        : { type: 'positive', text: 'All tasks are on schedule with no overdue items.', icon: CheckCircle2 },
      topPerformer: topPerformer ? {
        name: topPerformer.name,
        rate: topPerformer.completion_rate,
        stats: `${topPerformer.completed_tasks}/${topPerformer.assigned_tasks} tasks`,
        image: topPerformer.profile_image,
        plan: topPerformer.plan
      } : null
    }
  }

  const generateExecutiveSummary = () => {
    const data = getExecutiveSummaryData();
    if (!data) return '';
    
    let summary = `Team "${team.team_name}" Performance Report (Last ${selectedPeriod} Days)\n\n`;
    summary += `📊 OVERVIEW: ${data.overview.text} ${data.overview.trendText}\n\n`;
    summary += `🎯 STATUS BREAKDOWN:\n`;
    data.breakdown.forEach(b => {
      summary += `• ${b.label}: ${b.value} tasks${b.percentage !== undefined ? ` (${b.percentage}%)` : ''}\n`;
    });
    summary += `\n${data.alert.type === 'critical' ? '⚠️' : '✅'} ${data.alert.text.toUpperCase()}\n`;
    if (data.topPerformer) {
      summary += `\n🌟 TOP PERFORMER: ${data.topPerformer.name} leads with ${data.topPerformer.rate}% completion rate (${data.topPerformer.stats}).\n`;
    }
    return summary;
  }

  const generateInsights = () => {
    if (!reportData) return []
    
    const insights = []
    
    // Completion rate insight
    const completionRate = reportData.overview.completion_rate
    if (completionRate >= 80) {
      insights.push({
        type: 'positive',
        category: 'Performance',
        message: `Excellent completion rate of ${completionRate}%. The team is highly productive and on track.`
      })
    } else if (completionRate < 50) {
      insights.push({
        type: 'warning',
        category: 'Performance',
        message: `Completion rate of ${completionRate}% is below target. Consider redistributing workload or addressing blockers.`
      })
    }
    
    // Overdue tasks insight
    if (reportData.overview.overdue_tasks > 0) {
      insights.push({
        type: 'critical',
        category: 'Timeline',
        message: `${reportData.overview.overdue_tasks} overdue tasks detected. Immediate action required to get back on schedule.`
      })
    }
    
    // Project insight
    const atRiskProjects = reportData.project_stats.filter((p: any) => p.overdue > 0).length
    if (atRiskProjects > 0) {
      insights.push({
        type: 'warning',
        category: 'Projects',
        message: `${atRiskProjects} project(s) have overdue tasks and may be at risk of missing deadlines.`
      })
    }
    
    // Team balance insight
    const memberRates = reportData.member_performance.map((m: any) => m.completion_rate)
    const avgRate = memberRates.reduce((sum: number, rate: number) => sum + rate, 0) / memberRates.length
    const stdDev = Math.sqrt(memberRates.reduce((sum: number, rate: number) => sum + Math.pow(rate - avgRate, 2), 0) / memberRates.length)
    
    if (stdDev > 30) {
      insights.push({
        type: 'info',
        category: 'Team Balance',
        message: 'Significant variance in team member performance. Consider pairing high performers with those needing support.'
      })
    }
    
    // Workload insight
    const avgTasksPerMember = reportData.overview.total_tasks / reportData.member_performance.length
    if (avgTasksPerMember > 20) {
      insights.push({
        type: 'warning',
        category: 'Workload',
        message: `Average of ${avgTasksPerMember.toFixed(1)} tasks per member may indicate high workload. Monitor for burnout.`
      })
    }
    
    return insights
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!team || !reportData) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <h2 className="text-2xl font-bold mb-2">No Report Data</h2>
            <p className="text-muted-foreground mb-4">Unable to load team reports. Please check the console for errors.</p>
            <Button onClick={() => router.push(`/teams/${teamUrl}`)}>
              <ArrowLeft className="mr-2 size-4" />
              Back to Team
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const completionRate = reportData.overview.completion_rate || 0
  const trend = reportData.overview.completion_trend || 0

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-6 bg-muted/200">
        <div className="container px-4 md:px-6">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => router.push(`/teams/${teamUrl}`)}
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to Team
            </Button>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-1">Team Reports</h1>
                <p className="text-sm text-muted-foreground">{team.team_name} · Progress Analytics</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={exportReport} className="w-full sm:w-auto">
                  <Download className="mr-2 size-4" />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">CSV</span>
                </Button>
                <Button variant="outline" onClick={exportJSON} className="w-full sm:w-auto">
                  <FileText className="mr-2 size-4" />
                  <span className="hidden sm:inline">Export JSON Report</span>
                  <span className="sm:hidden">JSON</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {reportData.project_stats.map((proj: any) => (
                    <SelectItem key={proj.project_id} value={proj.project_id.toString()}>
                      {proj.project_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Overview Cards with StatsCard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total Tasks"
              value={reportData.overview.total_tasks.toString()}
              change={`${reportData.overview.total_projects} projects`}
              changeType="neutral"
              icon={Activity}
              description="Across all projects"
            />
            <StatsCard
              title="Completed"
              value={reportData.overview.completed_tasks.toString()}
              change={`${completionRate}%`}
              changeType="positive"
              icon={CheckCircle2}
              description="Completion rate"
            />
            <StatsCard
              title="In Progress"
              value={reportData.overview.in_progress_tasks.toString()}
              change="Active"
              changeType="neutral"
              icon={Clock}
              description="Currently working on"
            />
            <StatsCard
              title="Overdue"
              value={reportData.overview.overdue_tasks.toString()}
              change={reportData.overview.overdue_tasks > 0 ? "Needs attention" : "All on track"}
              changeType={reportData.overview.overdue_tasks > 0 ? "negative" : "positive"}
              icon={AlertCircle}
              description="Past due date"
            />
          </div>

          {/* Interactive Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
            {/* Task Status Distribution Pie Chart - 3 Categories */}
            {(() => {
              const pieData = [
                { name: 'Done', value: reportData.overview.completed_tasks || 0, fill: '#22c55e' },
                { name: 'In Progress', value: reportData.overview.in_progress_tasks || 0, fill: '#3b82f6' },
                { name: 'To Do', value: reportData.overview.todo_tasks || 0, fill: '#6b7280' }
              ].filter(item => item.value > 0)
              

              
              return reportData.overview.total_tasks > 0 && pieData.length > 0 ? (
                <ChartCard
                  title="Task Status Distribution"
                  data={pieData}
                  type="pie"
                  dataKey="value"
                  description={`${completionRate}% overall completion rate - ${reportData.overview.total_tasks} total tasks`}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Task Status Distribution</CardTitle>
                    <CardDescription>No tasks available</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <PieChart className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p>No task data to display</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })()}

            {/* Project Progress Bar Chart */}
            <ChartCard
              title="Project Progress Overview"
              data={reportData.project_stats.map((proj: any) => ({
                name: proj.project_name.length > 15 ? proj.project_name.substring(0, 15) + '...' : proj.project_name,
                completed: proj.completed,
                'in progress': proj.in_progress,
                todo: proj.todo
              }))}
              type="bar"
              dataKey="completed"
              xAxisKey="name"
              description="Tasks completed per project"
            />

            {/* Member Performance Line Chart */}
            <ChartCard
              title="Team Member Performance"
              data={reportData.member_performance.map((member: any) => ({
                name: member.name.split(' ')[0],
                'Completion Rate': member.completion_rate,
                'Tasks': member.assigned_tasks
              }))}
              type="line"
              dataKey="Completion Rate"
              xAxisKey="name"
              description="Individual completion rates"
            />

            {/* Completion Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Completion Trend
                </CardTitle>
                <CardDescription>Task completion rate over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{completionRate}%</div>
                    <Badge variant={trend >= 0 ? "default" : "destructive"} className="gap-1">
                      {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(trend)}% vs previous period
                    </Badge>
                  </div>
                  <Progress value={completionRate} className="h-3" />
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">{reportData.overview.completed_tasks}</div>
                      <div className="text-xs text-muted-foreground">Done</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">{reportData.overview.in_progress_tasks}</div>
                      <div className="text-xs text-muted-foreground">Progress</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-600">{reportData.overview.todo_tasks}</div>
                      <div className="text-xs text-muted-foreground">To Do</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-600">{reportData.overview.overdue_tasks}</div>
                      <div className="text-xs text-muted-foreground">Overdue</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="projects" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="projects" className="text-xs sm:text-sm">
                <FolderKanban className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline sm:ml-2">Projects</span>
              </TabsTrigger>
              <TabsTrigger value="members" className="text-xs sm:text-sm">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline sm:ml-2">Team Members</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="text-xs sm:text-sm">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline sm:ml-2">Timeline</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="text-xs sm:text-sm">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Report & Insights</span>
              </TabsTrigger>
            </TabsList>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Performance</CardTitle>
                  <CardDescription>Status breakdown by project</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.project_stats.map((project: any) => (
                      <div key={project.project_id} className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium">{project.project_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {project.total_tasks} total tasks
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400">
                              {project.completed} done
                            </Badge>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400">
                              {project.in_progress} in progress
                            </Badge>
                            {project.overdue > 0 && (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400">
                                {project.overdue} overdue
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Progress 
                          value={(project.completed / project.total_tasks) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Members Tab */}
            <TabsContent value="members" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Team Member Performance</CardTitle>
                  <CardDescription>Individual contribution and completion rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.member_performance.map((member: any, index: number) => (
                      <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <PlanAvatar
                            src={member.profile_image}
                            alt={member.name}
                            plan={member.plan}
                            fallback={
                              <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-bold">
                                {member.name ? member.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : '??'}
                              </div>
                            }
                            size="md"
                          />
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.role}
                              <span className="mx-1.5">·</span>
                              <span className={
                                member.plan === 'enterprise' ? 'text-red-500' :
                                member.plan === 'professional' ? 'text-blue-500' :
                                member.plan === 'starter' ? 'text-yellow-500' :
                                'text-emerald-500'
                              }>
                                {member.plan === 'enterprise' ? 'Enterprise' : 
                                 member.plan === 'professional' ? 'Professional' : 
                                 member.plan === 'starter' ? 'Starter' : 'Free'} Plan
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-around sm:justify-end">
                          <div className="text-center">
                            <div className="text-xl sm:text-2xl font-bold">{member.assigned_tasks}</div>
                            <div className="text-xs text-muted-foreground">Assigned</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{member.completed_tasks}</div>
                            <div className="text-xs text-muted-foreground">Completed</div>
                          </div>
                          <div className="text-center min-w-[60px] sm:min-w-[80px]">
                            <div className="text-xl sm:text-2xl font-bold">{member.completion_rate}%</div>
                            <div className="text-xs text-muted-foreground">Rate</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>Recent task updates and milestones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.recent_activity.map((activity: any, index: number) => (
                      <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                        <div className="flex flex-col items-center">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            activity.type === 'completed' ? 'bg-green-500' :
                            activity.type === 'started' ? 'bg-blue-500' :
                            'bg-gray-400'
                          }`} />
                          {index < reportData.recent_activity.length - 1 && (
                            <div className="w-px h-full bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.task_title}</p>
                          <p className="text-sm text-muted-foreground">
                            {activity.project_name} · {activity.user_name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={
                          activity.type === 'completed' ? 'default' :
                          activity.type === 'started' ? 'secondary' :
                          'outline'
                        }>
                          {activity.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Report & Insights Tab */}
            <TabsContent value="insights" className="space-y-4">
              {/* Executive Summary */}
              <Card className="overflow-hidden border-primary/20 shadow-lg shadow-primary/5">
                <CardHeader className="pb-2 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2 text-xl font-bold">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ repeat: Infinity, duration: 4 }}
                        >
                          <Sparkles className="h-5 w-5 text-primary" />
                        </motion.div>
                        Executive Summary
                      </CardTitle>
                      <CardDescription>AI-generated Performance Analysis</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 animate-pulse flex gap-1 items-center px-3 py-1">
                      <Wand2 className="size-3" />
                      AI Insights Live
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {(() => {
                    const data = getExecutiveSummaryData();
                    if (!data) return null;

                    return (
                      <div className="space-y-6">
                        {/* Animated Overview Section */}
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="relative p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border border-primary/10 overflow-hidden shadow-sm"
                        >
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Brain className="size-20" />
                          </div>
                          <div className="relative space-y-3">
                            <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
                              <Zap className="size-4" />
                              Strategic Overview
                            </div>
                            <div className="text-base md:text-lg leading-relaxed text-foreground/90 font-medium">
                              <Typewriter text={`${data.overview.text} ${data.overview.trendText}`} />
                            </div>
                          </div>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Status Breakdown Grid */}
                          <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="space-y-4"
                          >
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 px-1">
                              <BarChart3 className="size-3" />
                              Key Metrics
                            </h4>
                            <div className="grid grid-cols-1 gap-3">
                              {data.breakdown.map((item, i) => (
                                <motion.div 
                                  key={item.label}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.8 + (i * 0.1) }}
                                  className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted/60 transition-all hover:shadow-md hover:border-primary/20 group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${item.bg}/10 ${item.color} group-hover:scale-110 transition-transform`}>
                                      <item.icon className="size-4" />
                                    </div>
                                    <span className="text-sm font-semibold">{item.label}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
                                    {item.percentage !== undefined && (
                                      <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0">
                                        {item.percentage}%
                                      </Badge>
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>

                          {/* Insights & Top Performer Column */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 px-1">
                              <Activity className="size-3" />
                              Live Indicators
                            </h4>
                            {/* Critical Alert Card */}
                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.6 }}
                              className={`p-5 rounded-2xl border flex gap-4 shadow-sm ${
                                data.alert.type === 'critical' 
                                ? 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50' 
                                : 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900/50'
                              }`}
                            >
                              <div className={`mt-0.5 p-2.5 rounded-xl h-fit shadow-inner ${
                                data.alert.type === 'critical' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                              }`}>
                                <data.alert.icon className="size-5" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                                    data.alert.type === 'critical' ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    Team Status Alert
                                  </span>
                                  <div className={`size-1.5 rounded-full animate-ping ${
                                    data.alert.type === 'critical' ? 'bg-red-500' : 'bg-green-500'
                                  }`} />
                                </div>
                                <p className="text-sm font-medium leading-relaxed">{data.alert.text}</p>
                              </div>
                            </motion.div>

                            {/* Top Performer Spotlight */}
                            {data.topPerformer && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1, type: "spring", stiffness: 100 }}
                                className="relative p-5 rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50/50 to-orange-50/30 dark:border-yellow-900/30 dark:from-yellow-950/20 dark:to-orange-950/10 overflow-hidden group shadow-sm hover:shadow-md transition-all"
                              >
                                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:rotate-12 group-hover:scale-125 transition-all duration-700">
                                  <Sparkles className="size-24 text-yellow-500" />
                                </div>
                                <div className="relative flex items-center gap-4">
                                  <div className="relative">
                                    <PlanAvatar
                                      src={data.topPerformer.image}
                                      fallback={data.topPerformer.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                      plan={data.topPerformer.plan}
                                      size="lg"
                                      className="ring-4 ring-yellow-400/50"
                                    />
                                    <motion.div 
                                      animate={{ y: [0, -4, 0] }}
                                      transition={{ repeat: Infinity, duration: 2 }}
                                      className="absolute -top-1 -right-1 bg-yellow-400 text-white rounded-full p-1 shadow-md border border-white dark:border-gray-900"
                                    >
                                      <TrendingUp className="size-3" />
                                    </motion.div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest bg-yellow-400/10 px-2 py-0.5 rounded-full">Spotlight MVP</span>
                                    </div>
                                    <h5 className="text-base font-bold tracking-tight">{data.topPerformer.name}</h5>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                      <div className="size-1.5 rounded-full bg-yellow-500" />
                                      <span className="text-yellow-700 dark:text-yellow-500 font-bold">{data.topPerformer.rate}%</span>
                                      <span>Success Score</span>
                                      <span className="mx-1 opacity-30">|</span>
                                      <span>{data.topPerformer.stats}</span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                   
                        <div className="pt-4 flex items-center justify-between text-[9px] text-muted-foreground uppercase tracking-[0.3em] font-bold border-t border-border/60">
                          <div className="flex items-center gap-2">
                             <div className="size-1.5 rounded-full bg-primary/40" />
                             MorxAI v2.0.4 Processed
                          </div>
                          <span className="flex items-center gap-2 text-primary/70">
                            <Activity className="size-2.5 animate-pulse" />
                            Live Telemetry Active
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Key Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Key Insights & Recommendations
                  </CardTitle>
                  <CardDescription>Data-driven analysis and actionable suggestions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generateInsights().map((insight: any, index: number) => (
                      <div 
                        key={index} 
                        className={`p-4 rounded-lg border-l-4 ${
                          insight.type === 'positive' ? 'bg-green-50 border-green-500 dark:bg-green-950/20' :
                          insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500 dark:bg-yellow-950/20' :
                          insight.type === 'critical' ? 'bg-red-50 border-red-500 dark:bg-red-950/20' :
                          'bg-blue-50 border-blue-500 dark:bg-blue-950/20'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 ${
                            insight.type === 'positive' ? 'text-green-600 dark:text-green-400' :
                            insight.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                            insight.type === 'critical' ? 'text-red-600 dark:text-red-400' :
                            'text-blue-600 dark:text-blue-400'
                          }`}>
                            {insight.type === 'positive' && '✅'}
                            {insight.type === 'warning' && '⚠️'}
                            {insight.type === 'critical' && '🚨'}
                            {insight.type === 'info' && 'ℹ️'}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm mb-1">{insight.category}</div>
                            <div className="text-sm text-muted-foreground">{insight.message}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {generateInsights().length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No specific insights at this time. Keep up the good work!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Task Distribution Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Detailed Task Distribution
                  </CardTitle>
                  <CardDescription>Statistical breakdown of task categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">✓ Done</span>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                        {reportData.overview.completed_tasks}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-500 mt-1">
                        {reportData.overview.total_tasks > 0 
                          ? ((reportData.overview.completed_tasks / reportData.overview.total_tasks) * 100).toFixed(1)
                          : "0.0"}% of total tasks
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-400">◐ In Progress</span>
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                        {reportData.overview.in_progress_tasks}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                        {reportData.overview.total_tasks > 0
                          ? ((reportData.overview.in_progress_tasks / reportData.overview.total_tasks) * 100).toFixed(1)
                          : "0.0"}% of total tasks
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-950/20 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">○ To Do</span>
                        <Activity className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-700 dark:text-gray-400">
                        {reportData.overview.todo_tasks}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-500 mt-1">
                        {reportData.overview.total_tasks > 0
                          ? ((reportData.overview.todo_tasks / reportData.overview.total_tasks) * 100).toFixed(1)
                          : "0.0"}% of total tasks
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
