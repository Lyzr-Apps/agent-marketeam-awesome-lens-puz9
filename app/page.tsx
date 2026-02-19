'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { callAIAgent, AIAgentResponse } from '@/lib/aiAgent'
import { copyToClipboard } from '@/lib/clipboard'
import { FiFileText, FiImage, FiCopy, FiDownload, FiRefreshCw, FiClock, FiTrendingUp, FiEdit3, FiPlus, FiChevronRight, FiBarChart2, FiCheckCircle, FiAlertCircle, FiArrowLeft, FiStar, FiHash, FiTarget, FiEye, FiLayers, FiZap, FiSearch } from 'react-icons/fi'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

// ============================================================
// CONSTANTS
// ============================================================

const CONTENT_MANAGER_ID = '69977584321b34f0b20370ef'
const GRAPHIC_DESIGNER_ID = '699775923b886b94bdf0775e'

const THEME_VARS = {
  '--background': '30 40% 98%',
  '--foreground': '20 40% 10%',
  '--card': '30 40% 96%',
  '--card-foreground': '20 40% 10%',
  '--primary': '24 95% 53%',
  '--primary-foreground': '30 40% 98%',
  '--secondary': '30 35% 92%',
  '--secondary-foreground': '20 40% 15%',
  '--accent': '12 80% 50%',
  '--accent-foreground': '30 40% 98%',
  '--muted': '30 30% 90%',
  '--muted-foreground': '20 25% 45%',
  '--border': '30 35% 88%',
  '--input': '30 30% 80%',
  '--ring': '24 95% 53%',
  '--destructive': '0 84% 60%',
  '--radius': '0.875rem',
} as React.CSSProperties

// ============================================================
// TYPES
// ============================================================

type Screen = 'dashboard' | 'content-output' | 'content-history'

interface PrimaryKeyword {
  keyword: string
  volume: string
  density: string
}

interface SeoScorecard {
  seo_score: number
  primary_keywords: PrimaryKeyword[]
  secondary_keywords: string[]
  recommendations: string[]
  competitor_insights: string[]
  search_intent: string
}

interface ContentResult {
  article_title: string
  article_content: string
  meta_description: string
  content_type: string
  seo_scorecard: SeoScorecard
}

interface GraphicResult {
  image_description: string
  design_notes: string
  suggested_usage: string
}

interface Campaign {
  id: string
  topic: string
  audience: string
  contentType: string
  notes: string
  articleTitle: string
  articleContent: string
  metaDescription: string
  seoScore: number
  seoScorecard: SeoScorecard | null
  graphicUrl: string | null
  graphicDescription: string | null
  graphicDesignNotes: string | null
  graphicSuggestedUsage: string | null
  createdAt: string
}

// ============================================================
// SAMPLE DATA
// ============================================================

const SAMPLE_CONTENT_RESULT: ContentResult = {
  article_title: '10 Proven Strategies for SaaS Growth in 2025',
  article_content: '# 10 Proven Strategies for SaaS Growth in 2025\n\n## Introduction\n\nThe SaaS landscape is evolving rapidly. Companies that adapt their growth strategies to current market dynamics will outperform competitors. This comprehensive guide explores the most effective approaches to scaling your SaaS business.\n\n## 1. Product-Led Growth (PLG)\n\nProduct-led growth has become the dominant go-to-market strategy for modern SaaS companies. By letting your product drive acquisition, conversion, and expansion, you reduce customer acquisition costs while improving user satisfaction.\n\n### Key Tactics:\n- Offer a generous free tier or freemium model\n- Implement in-app onboarding flows\n- Use behavioral triggers for upgrade prompts\n- Track product-qualified leads (PQLs)\n\n## 2. Content Marketing at Scale\n\nHigh-quality, SEO-optimized content remains one of the highest-ROI channels for SaaS companies. Focus on creating comprehensive resources that address your target audience\'s pain points.\n\n### Best Practices:\n- Publish long-form pillar content (2,000+ words)\n- Create topic clusters around core keywords\n- Leverage AI tools for content ideation and drafts\n- Repurpose content across channels\n\n## 3. Strategic Partnerships\n\nForming alliances with complementary SaaS products can unlock new distribution channels and add value for existing customers through integrations.\n\n## 4. Customer Success as a Growth Engine\n\nInvesting in customer success reduces churn and drives expansion revenue through upsells, cross-sells, and referrals. Happy customers become your best advocates.\n\n## 5. Data-Driven Decision Making\n\nLeverage analytics and A/B testing across every touchpoint -- from landing pages to onboarding flows to pricing pages. Let data guide your growth experiments.\n\n## Conclusion\n\nGrowth in 2025 requires a multi-faceted approach. By combining product-led strategies with strong content, partnerships, and customer success programs, SaaS companies can achieve sustainable, compounding growth.',
  meta_description: 'Discover 10 proven SaaS growth strategies for 2025, including product-led growth, content marketing at scale, and data-driven optimization techniques.',
  content_type: 'Blog',
  seo_scorecard: {
    seo_score: 87,
    primary_keywords: [
      { keyword: 'SaaS growth strategies', volume: '3,400/mo', density: '2.1%' },
      { keyword: 'SaaS growth 2025', volume: '1,800/mo', density: '1.5%' },
      { keyword: 'product-led growth', volume: '5,200/mo', density: '1.8%' },
    ],
    secondary_keywords: ['customer acquisition cost', 'content marketing SaaS', 'SaaS partnerships', 'customer success', 'freemium model'],
    recommendations: [
      'Add more internal links to related content pieces',
      'Include a comparison table of growth strategies',
      'Add author bio and schema markup for E-E-A-T',
      'Include case study examples with measurable results',
      'Optimize images with descriptive alt text',
    ],
    competitor_insights: [
      'Top competitor articles average 2,500+ words on this topic',
      'HubSpot ranks #1 with a comprehensive guide format',
      'Most competing pages include downloadable templates or checklists',
      'Video content accompanies 60% of top-ranking pages',
    ],
    search_intent: 'Informational -- Users seeking actionable strategies to grow their SaaS business, primarily founders and marketing leads.',
  },
}

const SAMPLE_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    topic: 'SaaS Growth Strategies',
    audience: 'SaaS founders and marketing leaders',
    contentType: 'Blog',
    notes: '',
    articleTitle: '10 Proven Strategies for SaaS Growth in 2025',
    articleContent: SAMPLE_CONTENT_RESULT.article_content,
    metaDescription: SAMPLE_CONTENT_RESULT.meta_description,
    seoScore: 87,
    seoScorecard: SAMPLE_CONTENT_RESULT.seo_scorecard,
    graphicUrl: null,
    graphicDescription: null,
    graphicDesignNotes: null,
    graphicSuggestedUsage: null,
    createdAt: '2025-02-18T14:30:00Z',
  },
  {
    id: '2',
    topic: 'Email Marketing Automation Best Practices',
    audience: 'Digital marketers',
    contentType: 'Blog',
    notes: 'Focus on deliverability',
    articleTitle: 'The Ultimate Guide to Email Marketing Automation',
    articleContent: '# The Ultimate Guide to Email Marketing Automation\n\nEmail marketing automation is the backbone of modern digital marketing. This guide covers workflows, segmentation, and deliverability best practices.',
    metaDescription: 'Learn how to set up powerful email marketing automation workflows that drive engagement and conversions.',
    seoScore: 74,
    seoScorecard: null,
    graphicUrl: null,
    graphicDescription: null,
    graphicDesignNotes: null,
    graphicSuggestedUsage: null,
    createdAt: '2025-02-15T10:00:00Z',
  },
  {
    id: '3',
    topic: 'AI-Powered Customer Service',
    audience: 'Support team managers',
    contentType: 'Landing Page',
    notes: '',
    articleTitle: 'Transform Customer Service with AI',
    articleContent: '# Transform Customer Service with AI\n\nArtificial intelligence is revolutionizing how businesses handle customer inquiries. Reduce response times by 80% and boost satisfaction scores.',
    metaDescription: 'Discover how AI-powered customer service solutions can reduce response times by 80% and boost satisfaction scores.',
    seoScore: 92,
    seoScorecard: null,
    graphicUrl: null,
    graphicDescription: null,
    graphicDesignNotes: null,
    graphicSuggestedUsage: null,
    createdAt: '2025-02-10T08:15:00Z',
  },
]

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function formatInline(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">{part}</strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  )
}

function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### '))
          return <h4 key={i} className="font-semibold text-sm mt-3 mb-1 font-serif">{line.slice(4)}</h4>
        if (line.startsWith('## '))
          return <h3 key={i} className="font-semibold text-base mt-4 mb-2 font-serif">{line.slice(3)}</h3>
        if (line.startsWith('# '))
          return <h2 key={i} className="font-bold text-lg mt-5 mb-2 font-serif">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* '))
          return <li key={i} className="ml-4 list-disc text-sm leading-relaxed">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line))
          return <li key={i} className="ml-4 list-decimal text-sm leading-relaxed">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-2" />
        return <p key={i} className="text-sm leading-relaxed">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return 'hsl(24, 95%, 53%)'
  return 'hsl(0, 84%, 60%)'
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Needs Work'
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function SeoScoreCircle({ score }: { score: number }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const color = getScoreColor(score)

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(30, 30%, 90%)" strokeWidth="8" />
        <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={circumference - progress} strokeLinecap="round" transform="rotate(-90 50 50)" className="transition-all duration-1000" />
        <text x="50" y="46" textAnchor="middle" dominantBaseline="central" className="text-2xl font-bold" fill="currentColor">{score}</text>
        <text x="50" y="62" textAnchor="middle" dominantBaseline="central" className="text-[10px]" fill="hsl(20, 25%, 45%)">/ 100</text>
      </svg>
      <span className="text-xs font-medium" style={{ color }}>{getScoreLabel(score)}</span>
    </div>
  )
}

function ContentSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="space-y-3 mt-6">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="space-y-3 mt-6">
        <Skeleton className="h-6 w-2/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

function ScoreboardSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-center">
        <Skeleton className="h-24 w-24 rounded-full" />
      </div>
      <Skeleton className="h-5 w-1/3 mx-auto" />
      <Separator />
      <Skeleton className="h-5 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
      <Separator />
      <Skeleton className="h-5 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  )
}

function AgentStatusPanel({ activeAgentId }: { activeAgentId: string | null }) {
  const agents = [
    { id: CONTENT_MANAGER_ID, name: 'Marketing Content Manager', purpose: 'Coordinates SEO research and content writing' },
    { id: GRAPHIC_DESIGNER_ID, name: 'Graphic Designer Agent', purpose: 'Generates marketing visuals and graphics' },
  ]

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-md">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <FiZap className="h-3 w-3" /> Agent Status
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <div className="space-y-2">
          {agents.map((agent) => (
            <div key={agent.id} className="flex items-center gap-2 text-xs">
              <div className={`h-2 w-2 rounded-full flex-shrink-0 ${activeAgentId === agent.id ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
              <div className="min-w-0">
                <span className={`font-medium block truncate ${activeAgentId === agent.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {agent.name}
                </span>
                <span className="text-muted-foreground/70 text-[10px] block truncate">{agent.purpose}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function HistorySearchWrapper({ displayedCampaigns, mounted, onOpenCampaign, onBackToDashboard }: {
  displayedCampaigns: Campaign[]
  mounted: boolean
  onOpenCampaign: (c: Campaign) => void
  onBackToDashboard: () => void
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCampaigns = displayedCampaigns.filter((c) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      c.articleTitle.toLowerCase().includes(q) ||
      c.topic.toLowerCase().includes(q) ||
      c.contentType.toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-xl font-semibold font-serif text-foreground">All Campaigns</h3>
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-background/80 text-sm pl-9"
          />
        </div>
      </div>

      {filteredCampaigns.length === 0 ? (
        <Card className="border-border/50 bg-card/40 backdrop-blur-md">
          <CardContent className="py-16 text-center">
            <FiFileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              {displayedCampaigns.length === 0
                ? 'No campaigns yet -- create your first one from the Dashboard.'
                : 'No campaigns match your search.'}
            </p>
            {displayedCampaigns.length === 0 && (
              <Button variant="outline" size="sm" className="mt-4" onClick={onBackToDashboard}>
                <FiPlus className="h-3.5 w-3.5 mr-1.5" /> Create Campaign
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="col-span-5">Title</span>
            <span className="col-span-2">Type</span>
            <span className="col-span-2 text-center">SEO Score</span>
            <span className="col-span-1 text-center">Graphic</span>
            <span className="col-span-2 text-right">Date</span>
          </div>

          {filteredCampaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="border-border/50 bg-card/60 backdrop-blur-md hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer group"
              onClick={() => onOpenCampaign(campaign)}
            >
              <CardContent className="px-4 py-3">
                <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center space-y-2 md:space-y-0">
                  <div className="col-span-5">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {campaign.articleTitle}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate md:hidden">{campaign.metaDescription}</p>
                  </div>
                  <div className="col-span-2">
                    <Badge variant="secondary" className="text-[10px]">{campaign.contentType}</Badge>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-semibold" style={{ color: getScoreColor(campaign.seoScore) }}>
                      {campaign.seoScore}
                    </span>
                  </div>
                  <div className="col-span-1 text-center">
                    {campaign.graphicUrl ? (
                      <FiCheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-xs text-muted-foreground/50">--</span>
                    )}
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-xs text-muted-foreground">{mounted ? formatDate(campaign.createdAt) : ''}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// ERROR BOUNDARY
// ============================================================

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================

export default function Page() {
  // Navigation
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Sample data toggle
  const [showSampleData, setShowSampleData] = useState(false)

  // Form state
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('')
  const [contentType, setContentType] = useState('Blog')
  const [notes, setNotes] = useState('')

  // Content generation
  const [isGeneratingContent, setIsGeneratingContent] = useState(false)
  const [contentResult, setContentResult] = useState<ContentResult | null>(null)
  const [contentError, setContentError] = useState<string | null>(null)

  // Graphic generation
  const [isGeneratingGraphic, setIsGeneratingGraphic] = useState(false)
  const [graphicResult, setGraphicResult] = useState<GraphicResult | null>(null)
  const [graphicUrl, setGraphicUrl] = useState<string | null>(null)
  const [graphicError, setGraphicError] = useState<string | null>(null)

  // History
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)

  // UI state
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [seoTab, setSeoTab] = useState('keywords')

  // Mounted ref for date formatting
  const [mounted, setMounted] = useState(false)

  // Load campaigns from localStorage
  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem('mcc_campaigns')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setCampaigns(parsed)
        }
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  // Sample data prefill effect
  useEffect(() => {
    if (showSampleData && !contentResult) {
      setTopic('SaaS Growth Strategies')
      setAudience('SaaS founders and marketing leaders')
      setContentType('Blog')
      setNotes('Focus on product-led growth and content marketing')
    } else if (!showSampleData && !contentResult) {
      setTopic('')
      setAudience('')
      setContentType('Blog')
      setNotes('')
    }
  }, [showSampleData, contentResult])

  // Content generation handler
  const handleGenerateContent = useCallback(async () => {
    if (!topic.trim()) return
    setIsGeneratingContent(true)
    setContentError(null)
    setContentResult(null)
    setGraphicResult(null)
    setGraphicUrl(null)
    setGraphicError(null)
    setCurrentScreen('content-output')
    setActiveAgentId(CONTENT_MANAGER_ID)
    setStatusMessage('Generating content... This may take a moment.')

    const message = `Topic: ${topic}\nTarget Audience: ${audience || 'General'}\nContent Type: ${contentType}\nAdditional Notes: ${notes || 'None'}`

    try {
      const result: AIAgentResponse = await callAIAgent(message, CONTENT_MANAGER_ID)

      if (result.success) {
        const data = result?.response?.result as Partial<ContentResult> | undefined
        const resolved: ContentResult = {
          article_title: data?.article_title ?? 'Untitled Article',
          article_content: data?.article_content ?? '',
          meta_description: data?.meta_description ?? '',
          content_type: data?.content_type ?? contentType,
          seo_scorecard: {
            seo_score: data?.seo_scorecard?.seo_score ?? 0,
            primary_keywords: Array.isArray(data?.seo_scorecard?.primary_keywords) ? data!.seo_scorecard!.primary_keywords : [],
            secondary_keywords: Array.isArray(data?.seo_scorecard?.secondary_keywords) ? data!.seo_scorecard!.secondary_keywords : [],
            recommendations: Array.isArray(data?.seo_scorecard?.recommendations) ? data!.seo_scorecard!.recommendations : [],
            competitor_insights: Array.isArray(data?.seo_scorecard?.competitor_insights) ? data!.seo_scorecard!.competitor_insights : [],
            search_intent: data?.seo_scorecard?.search_intent ?? '',
          },
        }
        setContentResult(resolved)

        const campaign: Campaign = {
          id: Date.now().toString(),
          topic,
          audience,
          contentType,
          notes,
          articleTitle: resolved.article_title,
          articleContent: resolved.article_content,
          metaDescription: resolved.meta_description,
          seoScore: resolved.seo_scorecard.seo_score,
          seoScorecard: resolved.seo_scorecard,
          graphicUrl: null,
          graphicDescription: null,
          graphicDesignNotes: null,
          graphicSuggestedUsage: null,
          createdAt: new Date().toISOString(),
        }
        setCampaigns((prev) => {
          const updated = [campaign, ...prev]
          localStorage.setItem('mcc_campaigns', JSON.stringify(updated))
          return updated
        })
        setSelectedCampaign(campaign)
        setStatusMessage('Content generated successfully!')
      } else {
        setContentError(result?.error ?? result?.response?.message ?? 'Failed to generate content. Please try again.')
        setStatusMessage(null)
      }
    } catch {
      setContentError('An unexpected error occurred. Please try again.')
      setStatusMessage(null)
    }

    setIsGeneratingContent(false)
    setActiveAgentId(null)
  }, [topic, audience, contentType, notes])

  // Graphic generation handler
  const handleGenerateGraphic = useCallback(async () => {
    const titleSource = contentResult?.article_title ?? selectedCampaign?.articleTitle ?? topic
    const descSource = contentResult?.meta_description ?? selectedCampaign?.metaDescription ?? topic
    if (!titleSource) return

    setIsGeneratingGraphic(true)
    setGraphicError(null)
    setGraphicUrl(null)
    setGraphicResult(null)
    setActiveAgentId(GRAPHIC_DESIGNER_ID)
    setStatusMessage('Generating graphic...')

    const message = `Create a professional marketing visual for: ${titleSource}. Key messaging: ${descSource}. Content type: ${contentResult?.content_type ?? selectedCampaign?.contentType ?? contentType}`

    try {
      const result: AIAgentResponse = await callAIAgent(message, GRAPHIC_DESIGNER_ID)

      if (result.success) {
        const data = result?.response?.result as Partial<GraphicResult> | undefined
        setGraphicResult({
          image_description: data?.image_description ?? '',
          design_notes: data?.design_notes ?? '',
          suggested_usage: data?.suggested_usage ?? '',
        })

        const files = Array.isArray(result?.module_outputs?.artifact_files)
          ? result.module_outputs!.artifact_files
          : []
        const imageUrl = files?.[0]?.file_url ?? null
        setGraphicUrl(imageUrl)

        // Update campaign in history
        if (selectedCampaign) {
          setCampaigns((prev) => {
            const updated = prev.map((c) =>
              c.id === selectedCampaign.id
                ? {
                    ...c,
                    graphicUrl: imageUrl,
                    graphicDescription: data?.image_description ?? null,
                    graphicDesignNotes: data?.design_notes ?? null,
                    graphicSuggestedUsage: data?.suggested_usage ?? null,
                  }
                : c
            )
            localStorage.setItem('mcc_campaigns', JSON.stringify(updated))
            return updated
          })
          setSelectedCampaign((prev) =>
            prev
              ? {
                  ...prev,
                  graphicUrl: imageUrl,
                  graphicDescription: data?.image_description ?? null,
                  graphicDesignNotes: data?.design_notes ?? null,
                  graphicSuggestedUsage: data?.suggested_usage ?? null,
                }
              : null
          )
        }
        setStatusMessage('Graphic generated successfully!')
      } else {
        setGraphicError(result?.error ?? result?.response?.message ?? 'Failed to generate graphic.')
        setStatusMessage(null)
      }
    } catch {
      setGraphicError('An unexpected error occurred. Please try again.')
      setStatusMessage(null)
    }

    setIsGeneratingGraphic(false)
    setActiveAgentId(null)
  }, [contentResult, selectedCampaign, topic, contentType])

  // Copy handler
  const handleCopyContent = useCallback(async () => {
    const text = contentResult?.article_content ?? selectedCampaign?.articleContent ?? ''
    if (text) {
      await copyToClipboard(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [contentResult, selectedCampaign])

  // Download graphic handler
  const handleDownloadGraphic = useCallback(() => {
    const url = graphicUrl ?? selectedCampaign?.graphicUrl
    if (url) {
      const a = document.createElement('a')
      a.href = url
      a.download = `${contentResult?.article_title ?? selectedCampaign?.articleTitle ?? 'graphic'}.png`
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      a.click()
    }
  }, [graphicUrl, selectedCampaign, contentResult])

  // Open campaign from history
  const handleOpenCampaign = useCallback((campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setContentResult({
      article_title: campaign.articleTitle,
      article_content: campaign.articleContent,
      meta_description: campaign.metaDescription,
      content_type: campaign.contentType,
      seo_scorecard: campaign.seoScorecard ?? {
        seo_score: campaign.seoScore,
        primary_keywords: [],
        secondary_keywords: [],
        recommendations: [],
        competitor_insights: [],
        search_intent: '',
      },
    })
    setGraphicUrl(campaign.graphicUrl)
    setGraphicResult(
      campaign.graphicDescription
        ? {
            image_description: campaign.graphicDescription,
            design_notes: campaign.graphicDesignNotes ?? '',
            suggested_usage: campaign.graphicSuggestedUsage ?? '',
          }
        : null
    )
    setGraphicError(null)
    setContentError(null)
    setTopic(campaign.topic)
    setAudience(campaign.audience)
    setContentType(campaign.contentType)
    setNotes(campaign.notes)
    setCurrentScreen('content-output')
  }, [])

  // Navigate back to dashboard
  const handleBackToDashboard = useCallback(() => {
    setCurrentScreen('dashboard')
    setContentResult(null)
    setGraphicResult(null)
    setGraphicUrl(null)
    setContentError(null)
    setGraphicError(null)
    setSelectedCampaign(null)
    setStatusMessage(null)
    setTopic('')
    setAudience('')
    setContentType('Blog')
    setNotes('')
  }, [])

  // Displayed campaigns and content (with sample data support)
  const displayedCampaigns = showSampleData && campaigns.length === 0 ? SAMPLE_CAMPAIGNS : campaigns
  const displayedContent = showSampleData && !contentResult && currentScreen === 'content-output' ? SAMPLE_CONTENT_RESULT : contentResult

  // ============================================================
  // MAIN RENDER
  // ============================================================

  return (
    <ErrorBoundary>
      <div style={THEME_VARS} className="min-h-screen bg-background text-foreground font-sans">
        {/* Background gradient */}
        <div className="fixed inset-0 -z-10" style={{ background: 'linear-gradient(135deg, hsl(30, 50%, 97%) 0%, hsl(20, 45%, 95%) 35%, hsl(40, 40%, 96%) 70%, hsl(15, 35%, 97%) 100%)' }} />

        <div className="flex h-screen overflow-hidden">
          {/* ======================== SIDEBAR ======================== */}
          <aside className={`hidden md:flex flex-col border-r border-border/50 bg-card/40 backdrop-blur-xl transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-56'}`}>
            {/* Brand */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-border/50">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <FiZap className="h-4 w-4 text-primary-foreground" />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <h1 className="text-sm font-bold text-foreground leading-tight truncate">Marketing</h1>
                  <p className="text-[10px] text-muted-foreground leading-tight truncate">Command Center</p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1">
              {[
                { id: 'dashboard' as Screen, label: 'Dashboard', icon: <FiLayers className="h-4 w-4" /> },
                { id: 'content-history' as Screen, label: 'Content History', icon: <FiClock className="h-4 w-4" /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'dashboard') handleBackToDashboard()
                    else setCurrentScreen(item.id)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${currentScreen === item.id || (item.id === 'dashboard' && currentScreen === 'content-output') ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'}`}
                >
                  {item.icon}
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              ))}
            </nav>

            {/* Agent Status */}
            {!sidebarCollapsed && (
              <div className="px-3 pb-4">
                <AgentStatusPanel activeAgentId={activeAgentId} />
              </div>
            )}

            {/* Collapse */}
            <div className="px-3 pb-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-secondary/60 transition-colors"
              >
                <FiChevronRight className={`h-3.5 w-3.5 transition-transform duration-200 ${sidebarCollapsed ? '' : 'rotate-180'}`} />
                {!sidebarCollapsed && <span>Collapse</span>}
              </button>
            </div>
          </aside>

          {/* ======================== MAIN AREA ======================== */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* ======================== HEADER ======================== */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-card/30 backdrop-blur-lg flex-shrink-0">
              <div className="flex items-center gap-3">
                {/* Mobile brand */}
                <div className="md:hidden flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                    <FiZap className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-bold text-foreground">MCC</span>
                </div>
                {currentScreen === 'content-output' && (
                  <button
                    onClick={handleBackToDashboard}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <FiArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </button>
                )}
                <h2 className="text-lg font-semibold text-foreground font-serif">
                  {currentScreen === 'dashboard' && 'Dashboard'}
                  {currentScreen === 'content-output' && 'Content Output'}
                  {currentScreen === 'content-history' && 'Content History'}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {statusMessage && (
                  <span className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
                    {(isGeneratingContent || isGeneratingGraphic) && (
                      <FiRefreshCw className="h-3 w-3 animate-spin" />
                    )}
                    {!isGeneratingContent && !isGeneratingGraphic && statusMessage.includes('success') && (
                      <FiCheckCircle className="h-3 w-3 text-green-500" />
                    )}
                    {statusMessage}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <Label htmlFor="sample-toggle" className="text-xs text-muted-foreground cursor-pointer">
                    Sample Data
                  </Label>
                  <Switch
                    id="sample-toggle"
                    checked={showSampleData}
                    onCheckedChange={setShowSampleData}
                  />
                </div>
              </div>
            </header>

            {/* Mobile bottom nav */}
            <div className="md:hidden flex items-center border-b border-border/50 bg-card/30 backdrop-blur-lg flex-shrink-0">
              <button
                onClick={() => {
                  if (currentScreen !== 'dashboard') handleBackToDashboard()
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors ${currentScreen === 'dashboard' || currentScreen === 'content-output' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
              >
                <FiLayers className="h-3.5 w-3.5" /> Dashboard
              </button>
              <button
                onClick={() => setCurrentScreen('content-history')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors ${currentScreen === 'content-history' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
              >
                <FiClock className="h-3.5 w-3.5" /> History
              </button>
            </div>

            {/* ======================== DASHBOARD SCREEN ======================== */}
            {currentScreen === 'dashboard' && (
              <ScrollArea className="flex-1">
                <div className="p-6 max-w-5xl mx-auto space-y-8">
                  {/* Hero section */}
                  <div className="text-center space-y-2 py-4">
                    <h2 className="text-3xl font-bold font-serif text-foreground">Create Marketing Content</h2>
                    <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                      Enter a topic and let our AI agents research keywords, write optimized content, and generate stunning visuals -- all in one workflow.
                    </p>
                  </div>

                  {/* Content Brief Form */}
                  <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-serif flex items-center gap-2">
                        <FiEdit3 className="h-5 w-5 text-primary" />
                        Content Brief
                      </CardTitle>
                      <CardDescription>Fill out the details below to generate SEO-optimized content.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="topic" className="text-sm font-medium">
                          Topic / Brief <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="topic"
                          placeholder="Enter your marketing topic or brief..."
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          className="bg-background/80"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="audience" className="text-sm font-medium">Target Audience</Label>
                          <Input
                            id="audience"
                            placeholder="e.g., SaaS founders, marketing managers"
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            className="bg-background/80"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="content-type" className="text-sm font-medium">Content Type</Label>
                          <Select value={contentType} onValueChange={setContentType}>
                            <SelectTrigger id="content-type" className="bg-background/80">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Blog">Blog Post</SelectItem>
                              <SelectItem value="Social Post">Social Post</SelectItem>
                              <SelectItem value="Landing Page">Landing Page</SelectItem>
                              <SelectItem value="Ad Copy">Ad Copy</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-sm font-medium">Additional Notes (optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Any specific angle, keywords, or instructions..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={3}
                          className="bg-background/80"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button
                        onClick={handleGenerateContent}
                        disabled={!topic.trim() || isGeneratingContent}
                        className="w-full sm:w-auto h-11 px-8 text-sm font-semibold"
                        size="lg"
                      >
                        {isGeneratingContent ? (
                          <>
                            <FiRefreshCw className="h-4 w-4 animate-spin mr-2" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FiPlus className="h-4 w-4 mr-2" />
                            Generate Content
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Campaign History Grid */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold font-serif text-foreground flex items-center gap-2">
                        <FiClock className="h-5 w-5 text-muted-foreground" />
                        Recent Campaigns
                      </h3>
                      {displayedCampaigns.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => setCurrentScreen('content-history')}>
                          View All <FiChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      )}
                    </div>

                    {displayedCampaigns.length === 0 ? (
                      <Card className="border-border/50 bg-card/40 backdrop-blur-md">
                        <CardContent className="py-12 text-center">
                          <FiFileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">No campaigns yet -- create your first one above.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayedCampaigns.slice(0, 6).map((campaign) => (
                          <Card
                            key={campaign.id}
                            className="border-border/50 bg-card/60 backdrop-blur-md hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-pointer group"
                            onClick={() => handleOpenCampaign(campaign)}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                  {campaign.articleTitle}
                                </CardTitle>
                                <Badge variant="secondary" className="text-[10px] flex-shrink-0">{campaign.contentType}</Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-3">
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{campaign.metaDescription}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    <FiBarChart2 className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs font-medium" style={{ color: getScoreColor(campaign.seoScore) }}>
                                      {campaign.seoScore}
                                    </span>
                                  </div>
                                  {campaign.graphicUrl && (
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <FiImage className="h-3 w-3" />
                                    </div>
                                  )}
                                </div>
                                <span className="text-[10px] text-muted-foreground">{mounted ? formatDate(campaign.createdAt) : ''}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mobile Agent Status */}
                  <div className="md:hidden">
                    <AgentStatusPanel activeAgentId={activeAgentId} />
                  </div>
                </div>
              </ScrollArea>
            )}

            {/* ======================== CONTENT OUTPUT SCREEN ======================== */}
            {currentScreen === 'content-output' && (() => {
              const activeContent = displayedContent
              const activeScorecard = activeContent?.seo_scorecard
              const activeGraphicUrl = graphicUrl ?? selectedCampaign?.graphicUrl ?? null
              const activeGraphicResult = graphicResult ?? (selectedCampaign?.graphicDescription ? {
                image_description: selectedCampaign.graphicDescription,
                design_notes: selectedCampaign.graphicDesignNotes ?? '',
                suggested_usage: selectedCampaign.graphicSuggestedUsage ?? '',
              } : null)

              return (
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                  {/* Left Panel: Article */}
                  <div className="flex-1 lg:w-3/5 overflow-hidden flex flex-col border-r border-border/30">
                    <ScrollArea className="flex-1">
                      <div className="p-6">
                        {isGeneratingContent ? (
                          <ContentSkeleton />
                        ) : contentError ? (
                          <Card className="border-destructive/30 bg-destructive/5">
                            <CardContent className="py-8 text-center space-y-3">
                              <FiAlertCircle className="h-8 w-8 text-destructive mx-auto" />
                              <p className="text-sm text-destructive">{contentError}</p>
                              <Button variant="outline" size="sm" onClick={handleBackToDashboard}>
                                <FiArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Dashboard
                              </Button>
                            </CardContent>
                          </Card>
                        ) : activeContent ? (
                          <div className="space-y-6">
                            {/* Article header */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">{activeContent.content_type}</Badge>
                              </div>
                              <h1 className="text-2xl md:text-3xl font-bold font-serif text-foreground leading-tight">
                                {activeContent.article_title}
                              </h1>
                              {activeContent.meta_description && (
                                <p className="text-sm text-muted-foreground italic border-l-2 border-primary/40 pl-3">
                                  {activeContent.meta_description}
                                </p>
                              )}
                            </div>

                            {/* Action bar */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <Button variant="outline" size="sm" onClick={handleCopyContent}>
                                {copied ? (
                                  <>
                                    <FiCheckCircle className="h-3.5 w-3.5 mr-1.5 text-green-500" /> Copied
                                  </>
                                ) : (
                                  <>
                                    <FiCopy className="h-3.5 w-3.5 mr-1.5" /> Copy Article
                                  </>
                                )}
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => {
                                const fullText = `# ${activeContent.article_title}\n\n${activeContent.meta_description}\n\n${activeContent.article_content}`
                                const blob = new Blob([fullText], { type: 'text/markdown' })
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = `${activeContent.article_title || 'article'}.md`
                                a.click()
                                URL.revokeObjectURL(url)
                              }}>
                                <FiDownload className="h-3.5 w-3.5 mr-1.5" /> Export .md
                              </Button>
                            </div>

                            <Separator />

                            {/* Article content */}
                            <div className="max-w-none text-foreground">
                              {renderMarkdown(activeContent.article_content)}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-64 text-center">
                            <div>
                              <FiFileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                              <p className="text-sm text-muted-foreground">No content generated yet. Go back and create a brief.</p>
                              <Button variant="outline" size="sm" className="mt-3" onClick={handleBackToDashboard}>
                                <FiArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Dashboard
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Right Panel: SEO + Graphic */}
                  <div className="lg:w-2/5 overflow-hidden flex flex-col">
                    <ScrollArea className="flex-1">
                      <div className="p-6 space-y-6">
                        {/* SEO Scorecard */}
                        {isGeneratingContent ? (
                          <ScoreboardSkeleton />
                        ) : activeScorecard ? (
                          <Card className="border-border/50 bg-card/60 backdrop-blur-md">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base font-serif flex items-center gap-2">
                                <FiBarChart2 className="h-4 w-4 text-primary" />
                                SEO Scorecard
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                              {/* Score circle */}
                              <div className="flex justify-center">
                                <SeoScoreCircle score={activeScorecard.seo_score ?? 0} />
                              </div>

                              {/* Search intent */}
                              {activeScorecard.search_intent && (
                                <div className="bg-secondary/50 rounded-lg p-3">
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <FiTarget className="h-3.5 w-3.5 text-primary" />
                                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Search Intent</span>
                                  </div>
                                  <p className="text-xs text-foreground leading-relaxed">{activeScorecard.search_intent}</p>
                                </div>
                              )}

                              <Separator />

                              {/* Tabs for keyword data */}
                              <Tabs value={seoTab} onValueChange={setSeoTab}>
                                <TabsList className="w-full">
                                  <TabsTrigger value="keywords" className="flex-1 text-xs">Keywords</TabsTrigger>
                                  <TabsTrigger value="recommendations" className="flex-1 text-xs">Tips</TabsTrigger>
                                  <TabsTrigger value="competitors" className="flex-1 text-xs">Competitors</TabsTrigger>
                                </TabsList>

                                <TabsContent value="keywords" className="mt-4 space-y-4">
                                  {/* Primary keywords table */}
                                  <div>
                                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                                      <FiHash className="h-3 w-3" /> Primary Keywords
                                    </h4>
                                    {Array.isArray(activeScorecard.primary_keywords) && activeScorecard.primary_keywords.length > 0 ? (
                                      <div className="space-y-1.5">
                                        <div className="grid grid-cols-3 gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground px-2">
                                          <span>Keyword</span>
                                          <span className="text-center">Volume</span>
                                          <span className="text-right">Density</span>
                                        </div>
                                        {activeScorecard.primary_keywords.map((kw, i) => (
                                          <div key={i} className="grid grid-cols-3 gap-2 items-center bg-secondary/30 rounded-lg px-2 py-2 text-xs">
                                            <span className="font-medium text-foreground truncate">{kw?.keyword ?? ''}</span>
                                            <span className="text-center text-muted-foreground">{kw?.volume ?? '-'}</span>
                                            <span className="text-right text-muted-foreground">{kw?.density ?? '-'}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-muted-foreground">No keyword data available.</p>
                                    )}
                                  </div>

                                  {/* Secondary keywords */}
                                  {Array.isArray(activeScorecard.secondary_keywords) && activeScorecard.secondary_keywords.length > 0 && (
                                    <div>
                                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                                        <FiStar className="h-3 w-3" /> Secondary Keywords
                                      </h4>
                                      <div className="flex flex-wrap gap-1.5">
                                        {activeScorecard.secondary_keywords.map((kw, i) => (
                                          <Badge key={i} variant="outline" className="text-[10px] font-normal">{kw}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </TabsContent>

                                <TabsContent value="recommendations" className="mt-4">
                                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                                    <FiTrendingUp className="h-3 w-3" /> Recommendations
                                  </h4>
                                  {Array.isArray(activeScorecard.recommendations) && activeScorecard.recommendations.length > 0 ? (
                                    <ul className="space-y-2">
                                      {activeScorecard.recommendations.map((rec, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-foreground leading-relaxed">
                                          <FiCheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                                          <span>{rec}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-xs text-muted-foreground">No recommendations available.</p>
                                  )}
                                </TabsContent>

                                <TabsContent value="competitors" className="mt-4">
                                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                                    <FiEye className="h-3 w-3" /> Competitor Insights
                                  </h4>
                                  {Array.isArray(activeScorecard.competitor_insights) && activeScorecard.competitor_insights.length > 0 ? (
                                    <ul className="space-y-2">
                                      {activeScorecard.competitor_insights.map((insight, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-foreground leading-relaxed">
                                          <FiAlertCircle className="h-3.5 w-3.5 text-accent mt-0.5 flex-shrink-0" />
                                          <span>{insight}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-xs text-muted-foreground">No competitor insights available.</p>
                                  )}
                                </TabsContent>
                              </Tabs>
                            </CardContent>
                          </Card>
                        ) : null}

                        {/* Graphic Designer Section */}
                        <Card className="border-border/50 bg-card/60 backdrop-blur-md">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base font-serif flex items-center gap-2">
                              <FiImage className="h-4 w-4 text-primary" />
                              Marketing Graphic
                            </CardTitle>
                            <CardDescription className="text-xs">Generate a visual to accompany your content.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Generate button */}
                            {!isGeneratingGraphic && !activeGraphicUrl && (
                              <Button
                                onClick={handleGenerateGraphic}
                                disabled={isGeneratingGraphic || isGeneratingContent || (!activeContent && !selectedCampaign)}
                                variant="outline"
                                className="w-full"
                              >
                                <FiImage className="h-4 w-4 mr-2" />
                                Generate Graphic
                              </Button>
                            )}

                            {/* Loading */}
                            {isGeneratingGraphic && (
                              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                                <FiRefreshCw className="h-6 w-6 text-primary animate-spin" />
                                <p className="text-xs text-muted-foreground">Creating your visual...</p>
                              </div>
                            )}

                            {/* Error */}
                            {graphicError && (
                              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 space-y-2">
                                <p className="text-xs text-destructive flex items-center gap-1.5">
                                  <FiAlertCircle className="h-3.5 w-3.5" /> {graphicError}
                                </p>
                                <Button variant="outline" size="sm" onClick={handleGenerateGraphic} className="text-xs">
                                  <FiRefreshCw className="h-3 w-3 mr-1" /> Retry
                                </Button>
                              </div>
                            )}

                            {/* Image preview */}
                            {activeGraphicUrl && (
                              <div className="space-y-3">
                                <div className="rounded-lg overflow-hidden border border-border/50 bg-secondary/20">
                                  <img
                                    src={activeGraphicUrl}
                                    alt={activeGraphicResult?.image_description ?? 'Generated marketing graphic'}
                                    className="w-full h-auto object-cover"
                                    loading="lazy"
                                  />
                                </div>

                                {/* Graphic metadata */}
                                {activeGraphicResult && (
                                  <div className="space-y-2">
                                    {activeGraphicResult.image_description && (
                                      <div>
                                        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Description</span>
                                        <p className="text-xs text-foreground mt-0.5">{activeGraphicResult.image_description}</p>
                                      </div>
                                    )}
                                    {activeGraphicResult.design_notes && (
                                      <div>
                                        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Design Notes</span>
                                        <p className="text-xs text-foreground mt-0.5">{activeGraphicResult.design_notes}</p>
                                      </div>
                                    )}
                                    {activeGraphicResult.suggested_usage && (
                                      <div>
                                        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Suggested Usage</span>
                                        <p className="text-xs text-foreground mt-0.5">{activeGraphicResult.suggested_usage}</p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Graphic actions */}
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={handleDownloadGraphic} className="flex-1 text-xs">
                                    <FiDownload className="h-3 w-3 mr-1" /> Download
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={handleGenerateGraphic} disabled={isGeneratingGraphic} className="flex-1 text-xs">
                                    <FiRefreshCw className="h-3 w-3 mr-1" /> Regenerate
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )
            })()}

            {/* ======================== CONTENT HISTORY SCREEN ======================== */}
            {currentScreen === 'content-history' && (
              <ScrollArea className="flex-1">
                <HistorySearchWrapper
                  displayedCampaigns={displayedCampaigns}
                  mounted={mounted}
                  onOpenCampaign={handleOpenCampaign}
                  onBackToDashboard={handleBackToDashboard}
                />
              </ScrollArea>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
