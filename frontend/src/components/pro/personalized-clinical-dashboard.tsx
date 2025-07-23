// src/components/pro/personalized-clinical-dashboard.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { CheckSquare, MessageCircle, Bell, CalendarDays, Settings, PlusCircle, Edit2, GripVertical, Star, Loader2, ServerCrash } from "lucide-react";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, Reorder } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAiAgent } from "@/hooks/use-ai-agent";
import { getDashboardData, type ProDashboardData } from "@/ai/agents/pro/DashboardDataAgent";
import type { TaskItem } from "@/ai/schemas/pro-schemas";
import { HeroWidgets, type HeroTask } from '@/components/homepage/hero-widgets';
import { addDays } from 'date-fns';

interface DashboardWidget {
  id: string;
  title: string;
  icon: React.ElementType;
  content: React.ReactNode;
  defaultPosition: number;
  isFrequentlyUsed?: boolean; 
  colSpan?: string;
}


const sampleProTasks: HeroTask[] = [
    { id: 'task-pro-1', date: new Date(), title: 'Review Mr. Smith\'s latest CBC results', description: 'Priority: High. Check for trends.' },
    { id: 'task-pro-2', date: new Date(), title: 'On-call shift: 7 PM - 7 AM', description: 'Review handover notes before starting.' },
    { id: 'task-pro-3', date: addDays(new Date(), 1), title: 'Follow-up call with Mrs. Jones', description: 'Re: medication adjustment for hypertension.' },
];


export function PersonalizedClinicalDashboard() {
  const [isEditMode, setIsEditMode] = useState(false);
  const { data: dashboardData, isPending: isLoading, error, mutate: fetchDashboardData } = useAiAgent(getDashboardData);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (dashboardData) {
      setTasks(dashboardData.tasks);
    }
  }, [dashboardData]);

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };


  const widgets: DashboardWidget[] = [
     {
      id: 'patientAlerts',
      title: 'Key Patient Alerts',
      icon: Bell,
      defaultPosition: 0,
      isFrequentlyUsed: true,
      colSpan: 'lg:col-span-2',
      content: (
         <ScrollArea className="h-40">
          <ul className="space-y-2">
            {tasks?.filter(t => t.category === 'Patient Alert' && !t.completed).map(task => (
              <li key={task.id} className="flex items-center justify-between p-2 bg-destructive/10 border border-destructive/30 rounded-md text-sm">
                <span className="font-medium text-destructive">{task.text}</span>
                 <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => toggleTaskCompletion(task.id)}>
                  Acknowledge
                </Button>
              </li>
            ))}
            {tasks && tasks.filter(t => t.category === 'Patient Alert' && !t.completed).length === 0 && <p className="text-center text-muted-foreground py-4">No active alerts.</p>}
          </ul>
        </ScrollArea>
      )
    },
    {
      id: 'pendingTasks',
      title: 'Pending Tasks',
      icon: CheckSquare,
      defaultPosition: 1,
      isFrequentlyUsed: true, 
      colSpan: 'lg:col-span-1',
      content: (
        <ScrollArea className="h-60">
          <ul className="space-y-2">
            {tasks?.filter(t => !t.completed).map(task => (
              <li key={task.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm hover:bg-muted/70 transition-colors">
                <div>
                  <span className={cn("font-medium", task.priority === "High" && "text-destructive")}>{task.text}</span>
                  <div className="text-xs text-muted-foreground">
                    <span>{task.category}</span>
                    {task.dueDate && <span> • Due: {task.dueDate}</span>}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => toggleTaskCompletion(task.id)}>
                    <CheckSquare className="h-4 w-4"/>
                </Button>
              </li>
            ))}
            {tasks && tasks.filter(t => !t.completed).length === 0 && <p className="text-center text-muted-foreground py-4">No pending tasks!</p>}
          </ul>
        </ScrollArea>
      )
    },
    {
      id: 'messages',
      title: 'Messages & Communications',
      icon: MessageCircle,
      defaultPosition: 2,
      colSpan: 'lg:col-span-1',
      content: <p className="text-muted-foreground text-sm p-4 text-center">Secure messaging interface placeholder. (e.g., unread messages count, quick reply)</p>
    },
    {
      id: 'scheduleOverview',
      title: 'Schedule & On-Call',
      icon: CalendarDays,
      defaultPosition: 3,
      colSpan: 'lg:col-span-1',
      content: <p className="text-muted-foreground text-sm p-4 text-center">Today's appointments and on-call responsibilities placeholder.</p>
    }
  ];
  
  const [widgetOrder] = useState<string[]>(widgets.sort((a,b) => a.defaultPosition - b.defaultPosition).map(w => w.id));

  const renderContent = () => {
    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
    }
    if (error) {
        return <div className="p-4"><Card className="bg-destructive/10 border-destructive"><CardContent className="p-4 text-center text-destructive-foreground"><ServerCrash className="mx-auto h-8 w-8 mb-2"/><p>Failed to load dashboard data.</p><p className="text-xs">{error.message}</p></CardContent></Card></div>
    }
    if (!dashboardData) {
        return <p className="text-center text-muted-foreground py-10">No dashboard data available.</p>;
    }
    return (
      <>
        <div className="mb-8">
            <HeroWidgets tasks={sampleProTasks} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {widgetOrder.map(widgetId => {
            const widget = widgets.find(w => w.id === widgetId);
            if (!widget) return null;
            return (
                <motion.div
                key={widget.id}
                layout
                whileHover={!isEditMode ? { y: -3, boxShadow: "0px 8px 15px hsla(var(--primary) / 0.15)" } : {}}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                    "bg-card rounded-xl shadow-md border-2 border-transparent",
                    widget.colSpan || 'lg:col-span-1',
                    widget.isFrequentlyUsed && !isEditMode && "tool-card-frequent firebase-gradient-border-hover animate-subtle-pulse-glow",
                    isEditMode && "cursor-grab"
                )}
                >
                <Card className={cn("h-full border-none shadow-none", widget.isFrequentlyUsed && !isEditMode && "bg-transparent")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
                    <div className="flex items-center gap-2">
                        <widget.icon className={cn("h-5 w-5", widget.isFrequentlyUsed ? "text-primary" : "text-muted-foreground")} />
                        <CardTitle className="text-md font-medium">{widget.title}</CardTitle>
                    </div>
                    {isEditMode && <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" title="Drag to reorder (conceptual)" />}
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                    {widget.content}
                    </CardContent>
                </Card>
                </motion.div>
            );
            })}
        </div>
      </>
    )
  }

  return (
    <div className="p-1 fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground">My Clinical Dashboard</h2>
        <Button variant="outline" onClick={() => setIsEditMode(!isEditMode)} size="sm" className="rounded-lg group">
          {isEditMode ? <CheckSquare className="mr-2 h-4 w-4"/> : <Settings className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-45"/>}
          {isEditMode ? "Save Layout" : "Customize"}
        </Button>
      </div>
      {renderContent()}
    </div>
  );
}
