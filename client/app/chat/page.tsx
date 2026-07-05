'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useUser, UserButton } from '@clerk/nextjs'
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  MessageSquare,
  Sparkles,
  Cpu,
  Laptop,
  SquarePen
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

export default function ChatPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>('hitesh')
  const [inputValue, setInputValue] = useState<string>('')
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)
  const [recents, setRecents] = useState<string[]>(['HTML', 'Socket.io'])
  
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
  const currentInstructor = INSTRUCTORS.find(inst => inst.id === selectedInstructorId) || INSTRUCTORS[0]
  const currentMessages = chatHistory[selectedInstructorId] || []

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages, isTyping])

  // Get word count helper
  const getWordCount = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return 0
    return trimmed.split(/\s+/).length
  }

  const wordCount = getWordCount(inputValue)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const count = getWordCount(val)
    
    if (count <= 500) {
      setInputValue(val)
    } else {
      toast.error("Word Limit Reached", {
        description: "Your message cannot exceed 500 words."
      })
    }
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

  const handleNewChat = () => {
    setChatHistory(prev => ({
      ...prev,
      [selectedInstructorId]: [
        { id: `init-${Date.now()}`, sender: 'ai', text: currentInstructor.initialMessage }
      ]
    }))
    toast.success("Conversation history cleared. Start typing your new query below!")
  }

  return (
    <div className="flex-1 w-full flex h-screen overflow-hidden bg-gradient-to-b from-[#FAF7F2] to-[#F5ECE0] dark:from-[#1A1816] dark:to-[#11100F] text-foreground transition-colors duration-300">
      
      {/* Left Collapsible Sidebar */}
      <aside className={cn(
        "bg-card border-r border-dashed border-border/60 flex flex-col justify-between p-4 transition-all duration-300 ease-in-out select-none relative",
        isCollapsed ? "w-20" : "w-64"
      )}>
        
        {/* Top Section */}
        <div className="flex flex-col gap-6 flex-1 overflow-y-auto pr-1">
          
          {/* Logo Branding */}
          <div className="flex items-center gap-3 pb-4 border-b border-border/50 shrink-0">
            <Image 
              src="/logo.png" 
              alt="PERSONAAI Logo" 
              width={36} 
              height={36} 
              className="object-contain rounded-lg shadow-xs"
            />
            {!isCollapsed && (
              <span className="font-heading font-extrabold text-md bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                PersonaAI
              </span>
            )}
          </div>

          {/* Persona Available Selection */}
          <div className="flex flex-col gap-2 shrink-0">
            <h3 className={cn(
              "text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2",
              isCollapsed && "sr-only"
            )}>
              Persona Available
            </h3>
            <div className="flex flex-col gap-1.5">
              {INSTRUCTORS.map((instructor) => {
                const isSelected = selectedInstructorId === instructor.id
                return (
                  <button
                    key={instructor.id}
                    onClick={() => setSelectedInstructorId(instructor.id)}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-xl transition-all duration-200 text-left w-full cursor-pointer",
                      isSelected 
                        ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary" 
                        : "text-foreground/80 hover:bg-muted"
                    )}
                  >
                    <Avatar className="size-8 shrink-0 border border-border">
                      <AvatarImage src={instructor.avatar} alt={instructor.name} />
                      <AvatarFallback>{instructor.name[0]}</AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                      <span className="text-xs truncate">{instructor.name}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* New Chat Button */}
          <div className="shrink-0 pt-2">
            <button
              onClick={handleNewChat}
              className={cn(
                "flex items-center gap-2.5 p-2.5 rounded-xl border border-border hover:border-primary/30 bg-card hover:bg-muted text-foreground/85 transition-all text-xs font-semibold cursor-pointer w-full justify-center shadow-xs",
                isCollapsed ? "px-0" : ""
              )}
              title="Start a new chat session"
            >
              <SquarePen className="size-4 shrink-0" />
              {!isCollapsed && <span>New Chat</span>}
            </button>
          </div>

          {/* Recents Chat History List */}
          <div className="flex-1 flex flex-col gap-2 min-h-[120px]">
            <h3 className={cn(
              "text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2",
              isCollapsed && "sr-only"
            )}>
              Recents
            </h3>
            <div className="flex flex-col gap-1">
              {recents.map((recent, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    toast.info(`Recent chat: ${recent}`, {
                      description: `Viewing chat logs for ${recent}`
                    })
                  }}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-xl text-foreground/80 hover:bg-muted text-left transition-all cursor-pointer w-full",
                    isCollapsed ? "justify-center" : ""
                  )}
                >
                  <MessageSquare className="size-4 text-muted-foreground shrink-0" />
                  {!isCollapsed && (
                    <span className="text-xs truncate">{recent}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* User Info & Clerk UserButton at bottom */}
        <div className="pt-4 border-t border-border/50 shrink-0 flex items-center justify-between gap-3 overflow-hidden">
          <div className={cn(
            "flex items-center gap-2.5 truncate w-full transition-all",
            !isCollapsed && "border border-border/40 rounded-full p-1.5 pr-3 bg-muted/10 hover:bg-muted/20 cursor-pointer"
          )}>
            <UserButton />
            {!isCollapsed && isLoaded && (
              <div className="flex flex-col text-left truncate leading-tight">
                <span className="text-xs font-semibold truncate text-foreground">
                  {user?.fullName || user?.username}
                </span>
                <span className="text-[9px] text-muted-foreground truncate mt-0.5">
                  Active Student
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Minimal Toggle Arrow on the border line next to User Profile */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 bottom-6 z-10 size-6 rounded-full border border-border bg-background hover:bg-muted text-muted-foreground flex items-center justify-center cursor-pointer shadow-xs transition-all duration-200"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="size-3.5" />
          ) : (
            <ChevronLeft className="size-3.5" />
          )}
        </button>

      </aside>

      {/* Right Chat Window Area */}
      <section className="flex-1 flex flex-col bg-background/30 overflow-hidden relative">
        
        {/* Chat Window Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/30 shrink-0 select-none">
          <div className="flex flex-col text-left">
            <h2 className="font-heading font-extrabold text-sm text-foreground">
              {currentInstructor.name}
            </h2>
            <p className="text-[10px] text-muted-foreground truncate max-w-xs sm:max-w-md">
              {currentInstructor.role}
            </p>
          </div>
          
          <Avatar className="size-10 border border-primary/20">
            <AvatarImage src={currentInstructor.avatar} alt={currentInstructor.name} />
            <AvatarFallback>{currentInstructor.name[0]}</AvatarFallback>
          </Avatar>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-transparent to-background/10">
          <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            
            {currentMessages.map((msg) => {
              const isUser = msg.sender === 'user'
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex items-start gap-3 max-w-[85%]",
                    isUser ? "self-end flex-row-reverse text-right" : "self-start flex-row text-left"
                  )}
                >
                  {/* Sender Avatar */}
                  <Avatar className="size-8 shrink-0 border border-border mt-0.5">
                    {isUser ? (
                      <AvatarImage src={user?.imageUrl} alt={user?.fullName || 'User'} />
                    ) : (
                      <AvatarImage src={currentInstructor.avatar} alt={currentInstructor.name} />
                    )}
                    <AvatarFallback>
                      {isUser ? 'U' : currentInstructor.name[0]}
                    </AvatarFallback>
                  </Avatar>

                  {/* Message Bubble container */}
                  <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
                    <div
                      className={cn(
                        "px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-xs leading-relaxed text-left",
                        isUser
                          ? "bg-primary text-primary-foreground rounded-tr-xs"
                          : "bg-card text-foreground rounded-tl-xs border border-border/80"
                      )}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-muted-foreground/60 mt-1 px-1">
                      {isUser ? 'You' : currentInstructor.name.split(' ')[0]}
                    </span>
                  </div>
                </div>
              )
            })}

            {/* AI Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-3 max-w-[85%] self-start flex-row text-left">
                <Avatar className="size-8 shrink-0 border border-border mt-0.5">
                  <AvatarImage src={currentInstructor.avatar} alt={currentInstructor.name} />
                  <AvatarFallback>{currentInstructor.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <div className="px-4 py-3 rounded-2xl rounded-tl-xs bg-card border border-border/80 shadow-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Bottom Chat Input Form Bar */}
        <footer className="p-4 border-t border-border bg-card/20 shrink-0">
          <form onSubmit={handleCustomSubmit} className="flex items-center gap-3 max-w-3xl mx-auto w-full">
            
            {/* Input area */}
            <div className="relative flex-1">
              <Input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={`Message ${currentInstructor.name.split(' ')[0]}...`}
                disabled={isTyping}
                className={cn(
                  "pl-4 py-5.5 rounded-full border-border bg-card shadow-xs focus-visible:bg-background transition-all text-xs sm:text-sm w-full",
                  inputValue.trim().length > 0 ? "pr-28" : "pr-20"
                )}
              />
              
              {/* Inner Actions Container */}
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2.5">
                {/* Word count limit warning indicator */}
                <span className="text-[9px] sm:text-[10px] text-muted-foreground/60 font-mono select-none shrink-0">
                  {wordCount}/500 w
                </span>
                
                {/* Send Button (appears when user entered something) */}
                {inputValue.trim().length > 0 && (
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isTyping}
                    className="rounded-full bg-primary hover:bg-primary/95 text-primary-foreground size-8 shrink-0 cursor-pointer shadow-xs transition-all flex items-center justify-center"
                  >
                    <Send className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>

          </form>
        </footer>

      </section>

    </div>
  )
}
