'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useUser, SignInButton, SignUpButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { toast } from "sonner"
import { 
  Sparkles, 
  MessageSquare, 
  ArrowRight, 
  Zap, 
  Send,
  Lock,
  MessageCircle,
  HelpCircle,
  Code2,
  Laptop,
  CheckCircle2,
  ExternalLink,
  Loader2,
  ChevronLeft
} from 'lucide-react'

// Structure for the instructors
interface Instructor {
  id: string
  name: string
  avatar: string
  role: string
  description: string
  badges: string[]
  stats: string
  initialMessage: string
  prompts: { q: string; label: string }[]
}

const INSTRUCTORS: Instructor[] = [
  {
    id: 'hitesh',
    name: 'Hitesh Choudhary',
    avatar: '/hitesh.png',
    role: 'Coding Educator & Tech Entrepreneur',
    description: 'I make coding videos and run a few tech products that serve millions of users. ex-Founder LCO (acquired), ex-Sr. Director (Physics Wallah), ex-CTO @ iNeuron.ai. A chai lover who talks about cutting-edge tech and AI almost every day.',
    badges: ['Chai aur Code', 'Founder LCO', 'ex-CTO iNeuron', 'ex-Physics Wallah'],
    stats: '1.79M+ Subscribers • 2.5K+ Videos',
    initialMessage: "Chalo code likhte hain! 🚀 I'm your Hitesh AI Instructor. Ask me about Docker, Kubernetes, JS, Go, or system configurations. What are we building today?",
    prompts: [
      { q: "How do I dockerize a Node.js API?", label: "Dockerize API" },
      { q: "Explain Kubernetes in one sentence.", label: "Explain K8s" },
      { q: "What's the best backend language to learn now?", label: "Backend Career Advice" }
    ]
  },
  {
    id: 'piyush',
    name: 'Piyush Garg',
    avatar: '/Piyush-Garg.webp',
    role: 'Software Engineer, Content Creator, Educator',
    description: 'I build software and teach people how to build software. Founder of Teachyst, a white-labeled LMS that helps educators monetize their content globally.',
    badges: ['Teachyst', 'System Design', 'TypeScript', 'YouTube Creator'],
    stats: '396K Subscribers • 634 Videos',
    initialMessage: "Hey there! Let's understand systems design or build a scalable architecture. 💻 What's on your mind? Database scaling, load balancers, or React?",
    prompts: [
      { q: "What is horizontal vs vertical scaling?", label: "Explain Scaling" },
      { q: "How should I start learning System Design?", label: "System Design Path" },
      { q: "When should I choose Redis over standard cache?", label: "Why Redis?" }
    ]
  }
]

interface Message {
  id: string
  sender: 'user' | 'ai'
  text: string
}

export default function HomePage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>('hitesh')
  const [inputValue, setInputValue] = useState<string>('')
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [showDemo, setShowDemo] = useState<boolean>(false)
  
  // Maintain independent chat history for each instructor
  const [chatHistory, setChatHistory] = useState<Record<string, Message[]>>({
    hitesh: [
      { id: 'h1', sender: 'ai', text: INSTRUCTORS[0].initialMessage }
    ],
    piyush: [
      { id: 'p1', sender: 'ai', text: INSTRUCTORS[1].initialMessage }
    ]
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const demoTerminalRef = useRef<HTMLDivElement>(null)
  const currentInstructor = INSTRUCTORS.find(inst => inst.id === selectedInstructorId) || INSTRUCTORS[0]
  const currentMessages = chatHistory[selectedInstructorId] || []

  // Redirect signed-in users away from home page to /chat
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/chat')
    }
  }, [isLoaded, isSignedIn, router])

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages, isTyping])

  // Smooth scroll page down to the demo terminal when it opens
  useEffect(() => {
    if (showDemo) {
      const timer = setTimeout(() => {
        demoTerminalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [showDemo])

  // Delay the initial chat scroll to bottom slightly to coordinate with the card mount/slide-up transition
  useEffect(() => {
    if (showDemo) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 450)
      return () => clearTimeout(timer)
    }
  }, [showDemo])

  if (isLoaded && isSignedIn) {
    return (
      <div className="flex-1 w-full flex items-center justify-center bg-[#FAF7F2] dark:bg-[#1A1816] h-screen">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  // Get Reply based on keywords
  const getAIReply = (instructorId: string, text: string): string => {
    const query = text.toLowerCase()
    
    if (instructorId === 'hitesh') {
      if (query.includes('deploy') || query.includes('production') || query.includes('publish')) {
        return "Arey, super simple! We can dockerize the app, push it to a container registry, and deploy on AWS EC2, fly.io or Vercel for instant frontend projects. Chalo, let's write a Dockerfile first! 🐳"
      }
      if (query.includes('docker') || query.includes('kubernetes') || query.includes('k8s') || query.includes('container')) {
        return "Think of Docker as a shipping container for code—it packs everything so it runs anywhere. Kubernetes is the port manager that scales and schedules those containers automatically. Super simple and powerful! 🚀"
      }
      if (query.includes('javascript') || query.includes('js') || query.includes('node') || query.includes('golang') || query.includes('go')) {
        return "Languages are just tools, but core concepts are permanent. In Node.js, pay attention to the Event Loop. In Go, understand goroutines. Write clean code and keep building! Chalo code likhte hain! 👨‍💻"
      }
      if (query.includes('career') || query.includes('job') || query.includes('beginner') || query.includes('learn')) {
        return "Focus on building real, solid projects instead of just collecting certificates. Build an API, handle edge cases, write tests, and put it on GitHub. Consistency is your superpower! 💪"
      }
      return "That's a great question! Let's break it down simply. In modern backend engineering, we want our service to be fast, reliable, and clean. Tell me more about what you are trying to build! 🚀"
    } else {
      // Piyush Garg AI replies
      if (query.includes('deploy') || query.includes('production') || query.includes('aws')) {
        return "Deploying is easy, but keeping it cost-effective and highly available is where the real work lies. We can set up a CI/CD pipeline with GitHub Actions, deploy to AWS ECS using Fargate, and load balance it. Let's make it robust! ☁️"
      }
      if (query.includes('scale') || query.includes('system') || query.includes('load') || query.includes('traffic')) {
        return "To handle scale, first scale horizontally by adding instances behind Nginx or AWS Application Load Balancer. Next, add Redis cache to prevent database bottlenecks. Let's design a high-throughput system! 📈"
      }
      if (query.includes('design') || query.includes('architecture')) {
        return "System design is all about trade-offs. Start by understanding DNS, Load Balancers, Caching, Databases (SQL vs NoSQL), and Message Queues (Kafka/RabbitMQ). What scale and concurrency are we targeting here? 🧠"
      }
      if (query.includes('redis') || query.includes('cache')) {
        return "Use Redis when you have read-heavy workloads or need to cache session tokens. Since it runs in-memory, it is blazing fast (sub-millisecond latency). Always define key TTLs to prevent memory leaks! ⚡"
      }
      return "Interesting topic! From a system design perspective, we need to analyze network latency, storage performance, and CPU limits. What specific scaling challenge are we solving here? 💻"
    }
  }

  const handleSendMessage = (text: string) => {
    if (!text.trim() || isTyping) return

    // 1. Add user message
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text
    }

    setChatHistory(prev => ({
      ...prev,
      [selectedInstructorId]: [...(prev[selectedInstructorId] || []), userMsg]
    }))
    setInputValue('')
    setIsTyping(true)

    // 2. Simulate AI response with typing delay
    setTimeout(() => {
      const replyText = getAIReply(selectedInstructorId, text)
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText
      }

      setChatHistory(prev => ({
        ...prev,
        [selectedInstructorId]: [...(prev[selectedInstructorId] || []), aiMsg]
      }))
      setIsTyping(false)
    }, 1200)
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    handleSendMessage(inputValue)
  }

  return (
    <main className="flex-1 w-full flex flex-col items-center justify-start px-4 py-8 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FAF7F2] to-[#F5ECE0] dark:from-[#1A1816] dark:to-[#11100F] transition-colors duration-300">
      
      {/* Background Decorative Ambient Gradients */}
      <div className="absolute top-0 right-0 -z-10 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-20 left-0 -z-10 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-orange-400/5 blur-[100px] pointer-events-none" />

      {/* Hero Header Section */}
      <div className="flex flex-col items-center justify-center text-center mt-4 mb-8 sm:mb-12 space-y-4 max-w-2xl">
        <div className="relative flex items-center justify-center gap-4">
          <Image 
            src="/logo.png" 
            alt="PERSONAAI Logo" 
            width={64} 
            height={64} 
            className="relative object-contain"
          />
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent font-heading">
            PERSONAAI
          </h1>
        </div>
        
        <p className="text-lg sm:text-xl font-medium text-muted-foreground/90 font-sans tracking-tight">
          Let's Talk to your fav. Instructor
        </p>
      </div>

      {/* Main Container: Stacked Vertically */}
      <div className="flex flex-col gap-8 w-full max-w-4xl items-center">
        
        {/* Instructors Selection (Side-by-side on desktop, stacked on mobile) */}
        <div className="flex flex-col gap-4 w-full">
          <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase text-center md:text-left px-1">
            Select Your Instructor
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {INSTRUCTORS.map((instructor) => {
              const isSelected = selectedInstructorId === instructor.id
              return (
                <Card 
                  key={instructor.id}
                  onClick={() => setSelectedInstructorId(instructor.id)}
                  className={`group cursor-pointer transition-all duration-300 rounded-[24px] overflow-hidden ${
                    isSelected 
                      ? 'ring-2 ring-primary border-transparent bg-background shadow-lg scale-[1.01]' 
                      : 'border-border bg-card/60 hover:bg-card hover:border-primary/40 hover:-translate-y-1 hover:shadow-md'
                  }`}
                >
                  <CardContent className="p-5 flex flex-col items-center text-center space-y-4">
                    
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar className="size-20 border-2 border-primary/10 group-hover:border-primary/40 transition-all duration-300">
                        <AvatarImage src={instructor.avatar} alt={instructor.name} />
                        <AvatarFallback className="text-lg bg-primary/10 text-primary">
                          {instructor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Live/Active Badge */}
                      <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-background"></span>
                      </span>
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                      <h3 className="font-heading text-lg font-bold group-hover:text-primary transition-colors">
                        {instructor.name}
                      </h3>
                      <p className="text-xs font-semibold text-primary tracking-wide">
                        {instructor.role}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {instructor.description}
                    </p>

                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                      {instructor.badges.map((badge, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary" 
                          className="text-[10px] px-2 py-0.5 rounded-full bg-primary/5 hover:bg-primary/10 text-primary border-none"
                        >
                          {badge}
                        </Badge>
                      ))}
                    </div>

                    <div className="w-full pt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50">
                      <span>{instructor.stats}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedInstructorId(instructor.id)
                          setShowDemo(true)
                        }}
                        className="flex items-center gap-1 font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer bg-transparent border-none p-0 outline-none"
                      >
                        Try Demo <ArrowRight className="size-3" />
                      </button>
                    </div>

                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Action Buttons (Sign In / Sign Up) below cards */}
        <div className="w-full max-w-md flex flex-col items-center justify-center text-center">
          {isLoaded && !isSignedIn ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center gap-4">
                <SignInButton mode="modal">
                  <Button 
                    variant="outline" 
                    className="rounded-full px-8 py-5 border-2 border-primary/20 hover:border-primary/50 text-sm font-semibold transition-all duration-300 w-32 cursor-pointer"
                  >
                    Sign In
                  </Button>
                </SignInButton>
                
                <SignUpButton mode="modal">
                  <Button 
                    className="rounded-full px-8 py-5 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold transition-all duration-300 w-32 cursor-pointer shadow-md shadow-primary/20"
                  >
                    Sign Up
                  </Button>
                </SignUpButton>
              </div>
              <p className="text-xs text-muted-foreground max-w-xs">
                Unlock full custom chats and persistent logs.
              </p>
            </div>
          ) : (
            <div className="h-10 flex items-center justify-center">
              <Loader2 className="size-5 animate-spin text-primary/50" />
            </div>
          )}
        </div>

        {/* Demo Chat Terminal below cards & buttons */}
        {showDemo && (
          <div 
            ref={demoTerminalRef}
            className="w-full flex flex-col h-[520px] rounded-[28px] border border-border/80 bg-card/75 backdrop-blur-md shadow-xl overflow-hidden animate-slide-up"
          >
            
            {/* Chat Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/80 bg-background/50">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDemo(false)}
                  className="rounded-full h-8 w-8 hover:bg-muted cursor-pointer shrink-0 flex items-center justify-center"
                  title="Back to Instructors"
                >
                  <ChevronLeft className="size-4 text-muted-foreground" />
                </Button>
                <div className="relative">
                  <Avatar className="size-10 border border-primary/20">
                    <AvatarImage src={currentInstructor.avatar} alt={currentInstructor.name} />
                    <AvatarFallback>{currentInstructor.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                </div>
                
                <div>
                  <h4 className="font-heading font-bold text-sm text-foreground">
                    {currentInstructor.name} AI
                  </h4>
                  <p className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Online Assistant
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-[10px] border-primary/20 text-primary font-mono bg-primary/5 px-2 py-0.5 rounded-md">
                  {currentInstructor.id.toUpperCase()}-GPT v1.0
                </Badge>
              </div>
            </div>

            {/* Message Area */}
            <ScrollArea className="flex-1 p-5 bg-gradient-to-b from-transparent to-background/20">
              <div className="flex flex-col gap-4">
                
                {/* Informative Note */}
                <div className="self-center w-full max-w-sm text-center p-3 rounded-2xl bg-secondary/30 border border-border/50 text-[11px] text-muted-foreground leading-relaxed my-2">
                  ⚡ This is an interactive demo of {currentInstructor.name}'s AI character. Try the quick prompts below to see instant responses.
                </div>

                {currentMessages.map((msg) => {
                  const isUser = msg.sender === 'user'
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] ${isUser ? 'self-end' : 'self-start'}`}
                    >
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-xs leading-relaxed ${
                          isUser
                            ? 'bg-primary text-primary-foreground rounded-tr-xs'
                            : 'bg-card text-foreground rounded-tl-xs border border-border/80'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-muted-foreground/60 mt-1 px-1 self-end">
                        {isUser ? 'You' : currentInstructor.name.split(' ')[0]}
                      </span>
                    </div>
                  )
                })}

                {/* Typing Animation */}
                {isTyping && (
                  <div className="flex flex-col max-w-[85%] self-start">
                    <div className="px-4 py-3 rounded-2xl rounded-tl-xs bg-card border border-border/80 shadow-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Prompts Panel */}
            <div className="px-5 py-3 bg-background/30 border-t border-border/50 flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                <Sparkles className="size-3 text-primary animate-pulse" />
                Suggested Prompts (Click to ask):
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {currentInstructor.prompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt.q)}
                    disabled={isTyping}
                    className="text-[11px] text-foreground bg-card hover:bg-primary hover:text-primary-foreground px-3 py-1.5 rounded-full border border-border hover:border-transparent transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Input Panel */}
            <form onSubmit={handleCustomSubmit} className="p-4 bg-background border-t border-border/80 flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder={
                    isSignedIn 
                      ? `Ask ${currentInstructor.name.split(' ')[0]} anything...` 
                      : `Sign in to type, or click the quick prompts above...`
                  }
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isTyping}
                  className="pr-10 rounded-full border-border bg-secondary/40 py-5.5 focus-visible:bg-background transition-all"
                />
                {!isSignedIn && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none">
                    <Lock className="size-4" />
                  </div>
                )}
              </div>
              
              <Button
                type="submit"
                size="icon"
                disabled={isTyping || !inputValue.trim()}
                className="rounded-full bg-primary hover:bg-primary/95 text-primary-foreground size-10 shrink-0 cursor-pointer shadow-md shadow-primary/10"
              >
                <Send className="size-4" />
              </Button>
            </form>

          </div>
        )}

      </div>

    </main>
  )
}
