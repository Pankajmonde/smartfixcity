
import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Bot, AlertTriangle, X, Send, ChevronUp, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchReports, updateReportStatus, submitReport } from '@/lib/api';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ReportStatus, ReportFormData, ReportType } from '@/types';
import { useAdminAuth } from '@/hooks/use-admin-auth';

type MessageType = {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const SmartCityBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { isAdmin } = useAdminAuth();

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: MessageType = {
        id: generateId(),
        content: 'Welcome to CityFix! How can I help you today? Type "help" to see what I can do.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newUserMessage: MessageType = {
      id: generateId(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await processMessage(inputValue);
      
      setTimeout(() => {
        setIsTyping(false);
        const botResponse: MessageType = {
          id: generateId(),
          content: response,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000 + Math.random() * 1000);
    } catch (error) {
      console.error('Error processing message:', error);
      setIsTyping(false);
      
      const errorMessage: MessageType = {
        id: generateId(),
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const processMessage = async (message: string): Promise<string> => {
    const normalizedMessage = message.trim().toLowerCase();
    
    if (normalizedMessage === 'help') {
      return `
Here's what I can help you with:

📋 **Report an Issue**
- Type: "Report a [issue type] at [location]"
- Example: "Report a pothole at MG Road"

📊 **Check Status**
- Type: "Check status of report [ID]"
- Example: "Check status of report report-123"

${isAdmin ? `⚙️ **Admin Commands** (Admin Only)
- "Show all open reports"
- "Update report [ID] to [status]"
- Example: "Update report report-123 to in_progress"` : ''}

❓ **FAQs**
- "What is this project?"
- "How do I report an issue?"
- "What's the status process?"
- "Who can use this app?"

Try one of these commands to get started!
      `;
    }
    
    if (normalizedMessage.includes('what is this project') || normalizedMessage.includes('about this project')) {
      return `
CityFix is an AI-powered platform designed for Smart India Hackathon (SIH) that helps citizens report infrastructure issues in their city.

Our platform uses artificial intelligence to categorize and prioritize issues, making it easier for authorities to address them efficiently. Citizens can report problems like potholes, water leaks, broken streetlights, and more, with the option to upload photos and mark the exact location on a map.

By connecting citizens directly with local authorities, we aim to make cities more responsive and livable for everyone.
      `;
    }
    
    if (normalizedMessage.includes('how do i report') || normalizedMessage.includes('how to report')) {
      return `
You can report an issue in two ways:

1. **Through the Web Interface:**
   - Click on "Report" in the navigation menu
   - Fill out the form with details about the issue
   - Upload photos of the problem
   - Mark the location on the map
   - Submit your report

2. **Through this Chat:**
   - Type "Report a [issue type] at [location]"
   - Example: "Report a pothole at MG Road"
   - I'll ask you for any additional details needed

Your report will be submitted to the appropriate authorities for review and action.
      `;
    }
    
    if (normalizedMessage.includes('status process') || normalizedMessage.includes('how does status work')) {
      return `
When you submit a report, it goes through these status stages:

1. **Pending**: Your report has been received and is awaiting review
2. **Investigating**: Authorities are assessing the issue
3. **In Progress**: Work has begun to fix the reported problem
4. **Resolved**: The issue has been fixed

You can check the status of your report anytime by:
- Visiting the Dashboard page
- Using this chat bot (type "Check status of report [ID]")
- Checking your email for notifications (if provided)

Each status update is timestamped so you can track progress.
      `;
    }
    
    if (normalizedMessage.includes('who can use this') || normalizedMessage.includes('who is this for')) {
      return `
CityFix is designed for:

**Citizens**: Anyone can report infrastructure issues in their city, check status of reports, and see what issues have been reported and resolved in their area.

**Municipal Authorities**: City officials can access an administrative dashboard to manage reports, update statuses, and prioritize work.

**Visitors**: Even visitors to the city can report issues they notice.

The platform is open to everyone who wants to contribute to making their city better. No registration is required to submit a report, although providing contact information helps authorities follow up if needed.
      `;
    }
    
    if (
      normalizedMessage.startsWith('report') || 
      normalizedMessage.includes('there is a') || 
      normalizedMessage.includes("there's a")
    ) {
      let type: ReportType = 'other';
      if (normalizedMessage.includes('pothole')) type = 'pothole';
      else if (normalizedMessage.includes('water leak') || normalizedMessage.includes('leak')) type = 'water_leak';
      else if (normalizedMessage.includes('street light') || normalizedMessage.includes('streetlight')) type = 'street_light';
      else if (normalizedMessage.includes('graffiti')) type = 'graffiti';
      else if (normalizedMessage.includes('trash') || normalizedMessage.includes('garbage')) type = 'trash';
      else if (normalizedMessage.includes('sidewalk')) type = 'sidewalk';
      else if (normalizedMessage.includes('traffic light')) type = 'traffic_light';
      else if (normalizedMessage.includes('emergency')) type = 'emergency';
      
      if (normalizedMessage.length < 15) {
        return `
To report an issue, please provide more details or use our report form.

Would you like me to:
1. Direct you to the full report form where you can upload photos and mark the exact location?
2. Continue reporting through chat? (Please provide more details about the issue and location)

For example: "Report a pothole on Main Street near the library"
        `;
      }
      
      return `
Thanks for reporting this issue! To submit a complete report with photos and exact location, I recommend using our report form.

Would you like me to take you to the report form? Reply with "Yes" to go to the form or "No" to continue in chat.

Based on your message, I've identified this as a ${type.replace('_', ' ')} issue.
      `;
    }
    
    if (normalizedMessage === 'yes' && messages[messages.length - 2]?.content.includes('report form')) {
      setTimeout(() => {
        navigate('/report');
      }, 500);
      
      return 'Taking you to the report form now...';
    }
    
    if (normalizedMessage.includes('status') && normalizedMessage.includes('report')) {
      const words = normalizedMessage.split(' ');
      const reportIdIndex = words.findIndex(word => word.includes('report-'));
      
      if (reportIdIndex !== -1) {
        const reportId = words[reportIdIndex];
        
        try {
          const reports = await fetchReports();
          const report = reports.find(r => r.id === reportId);
          
          if (report) {
            const reportDate = new Date(report.createdAt);
            const lastUpdated = new Date(report.updatedAt);
            
            return `
**Report ${reportId}**
Status: ${report.status.replace('_', ' ')}
Type: ${report.type.replace('_', ' ')}
Location: ${report.location.address}
Reported: ${format(reportDate, 'PPP')}
Last updated: ${format(lastUpdated, 'PPP')}

${report.status === 'resolved' 
  ? '✅ This issue has been resolved.' 
  : report.status === 'in_progress' 
    ? '🔧 Work is in progress on this issue.' 
    : report.status === 'investigating' 
      ? '🔍 Authorities are investigating this issue.' 
      : '⏳ This report is pending review.'}
            `;
          } else {
            return `I couldn't find a report with ID ${reportId}. Please check the ID and try again.`;
          }
        } catch (error) {
          console.error('Error fetching report status:', error);
          return 'Sorry, I encountered an error retrieving the report status. Please try again later.';
        }
      } else {
        return 'Please provide a valid report ID. For example: "Check status of report report-123"';
      }
    }
    
    if (isAdmin) {
      if (normalizedMessage.includes('show') && 
          (normalizedMessage.includes('open reports') || normalizedMessage.includes('pending reports'))) {
        try {
          const reports = await fetchReports();
          const openReports = reports.filter(r => r.status !== 'resolved');
          
          if (openReports.length === 0) {
            return 'There are currently no open reports. All issues have been resolved.';
          }
          
          const reportsText = openReports.slice(0, 5).map(report => 
            `- ${report.id}: ${report.type.replace('_', ' ')} at ${report.location.address} (${report.status.replace('_', ' ')})`
          ).join('\n');
          
          return `
Here are the most recent open reports (showing ${Math.min(5, openReports.length)} of ${openReports.length}):

${reportsText}

${openReports.length > 5 ? 'Visit the admin dashboard to see all reports.' : ''}
          `;
        } catch (error) {
          console.error('Error fetching open reports:', error);
          return 'Sorry, I encountered an error retrieving open reports. Please try again later.';
        }
      }
      
      if (normalizedMessage.includes('update report') && 
          (normalizedMessage.includes('to pending') || 
           normalizedMessage.includes('to investigating') || 
           normalizedMessage.includes('to in progress') || 
           normalizedMessage.includes('to resolved'))) {
        
        const words = normalizedMessage.split(' ');
        const reportIdIndex = words.findIndex(word => word.includes('report-'));
        
        if (reportIdIndex !== -1) {
          const reportId = words[reportIdIndex];
          
          let newStatus: ReportStatus = 'pending';
          if (normalizedMessage.includes('to investigating')) newStatus = 'investigating';
          else if (normalizedMessage.includes('to in progress') || normalizedMessage.includes('to in_progress')) newStatus = 'in_progress';
          else if (normalizedMessage.includes('to resolved')) newStatus = 'resolved';
          
          try {
            await updateReportStatus(reportId, newStatus);
            
            toast.success(`Report ${reportId} updated to ${newStatus.replace('_', ' ')}`);
            
            return `I've updated report ${reportId} to status: ${newStatus.replace('_', ' ')}`;
          } catch (error) {
            console.error('Error updating report status:', error);
            return 'Sorry, I encountered an error updating the report status. Please try again later.';
          }
        } else {
          return 'Please provide a valid report ID. For example: "Update report report-123 to resolved"';
        }
      }
    }
    
    return `
I'm not sure how to help with that. Here are some suggestions:

- Type "help" to see all available commands
- Type "What is this project?" to learn about CityFix
- Type "How do I report an issue?" for reporting instructions
${isAdmin ? '- Type "Show open reports" to see pending issues' : ''}

Or you can report an issue by typing something like "Report a pothole at Main Street"
    `;
  };

  return (
    <>
      <div className="fixed right-5 bottom-5 z-50">
        <AnimatePresence>
          {!isOpen ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.5 }}
            >
              <Button 
                onClick={toggleChat} 
                size="lg" 
                className="rounded-full w-14 h-14 shadow-lg"
              >
                <MessageSquare className="h-6 w-6" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-background border rounded-full shadow-lg p-2"
            >
              <Button
                onClick={toggleChat}
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
              >
                <ChevronUp className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed right-5 bottom-20 z-50 w-full max-w-md shadow-xl rounded-lg overflow-hidden border bg-background"
            initial={{ y: 20, opacity: 0, height: 0 }}
            animate={{ y: 0, opacity: 1, height: 'auto' }}
            exit={{ y: 20, opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <h3 className="font-semibold">CityFix Assistant</h3>
              </div>
              <Button
                onClick={toggleChat}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary/90"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-96 p-4" ref={scrollRef}>
              <div className="flex flex-col gap-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      }`}
                    >
                      {message.sender === 'bot' && (
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="h-6 w-6">
                            <Bot className="h-4 w-4" />
                          </Avatar>
                          <span className="text-xs font-medium">CityFix Bot</span>
                        </div>
                      )}
                      <div className="whitespace-pre-line text-sm">
                        {message.content}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          message.sender === 'user'
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {format(message.timestamp, 'h:mm a')}
                      </div>
                    </motion.div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="max-w-[85%] rounded-lg p-3 bg-muted"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <Bot className="h-4 w-4" />
                        </Avatar>
                        <span className="text-xs font-medium">CityFix Bot</span>
                      </div>
                      <div className="flex items-center gap-1 h-6">
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  placeholder="Type a message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!inputValue.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <HelpCircle className="h-3 w-3" />
                <span>Type "help" to see available commands</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SmartCityBot;
