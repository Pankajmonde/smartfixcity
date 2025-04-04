
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle, Bot, Send, User, X, HelpCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchReportById, fetchFilteredReports, updateReportStatus } from '@/lib/api';
import { Report, ReportType } from '@/types';
import { toast } from 'sonner';
import { useAdminAuth } from '@/hooks/use-admin-auth';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface SuggestedAction {
  label: string;
  action: string;
}

const SmartCityBot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { isAdmin } = useAdminAuth();

  // Add initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: `bot-${Date.now()}`,
        content: "Hello! I'm SmartCityBot. How can I help you today? Type 'help' to see what I can do.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setSuggestedActions([
        { label: 'Help', action: 'help' },
        { label: 'Report Issue', action: 'I want to report an issue' },
        { label: 'Check Status', action: 'Check status of my report' },
      ]);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const addMessage = (content: string, sender: 'user' | 'bot') => {
    const newMessage: Message = {
      id: `${sender}-${Date.now()}`,
      content,
      sender,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = inputValue.trim();
    addMessage(userMessage, 'user');
    setInputValue('');
    setIsProcessing(true);
    setSuggestedActions([]);
    
    try {
      await processUserMessage(userMessage);
    } catch (error) {
      console.error('Error processing message:', error);
      addMessage("I'm sorry, I encountered an error. Please try again.", 'bot');
    } finally {
      setIsProcessing(false);
    }
  };

  const processUserMessage = async (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Help command
    if (lowerMessage === 'help') {
      handleHelpCommand();
      return;
    }
    
    // Check status command
    if (lowerMessage.includes('status') && lowerMessage.includes('id')) {
      const matches = lowerMessage.match(/id\s*(\d+)/i);
      if (matches && matches[1]) {
        await handleStatusCheck(matches[1]);
        return;
      }
    }
    
    // Report issue command
    if (lowerMessage.includes('report') || 
        lowerMessage.includes('pothole') || 
        lowerMessage.includes('water leak') || 
        lowerMessage.includes('light') || 
        lowerMessage.includes('trash') || 
        lowerMessage.includes('graffiti')) {
      handleReportIssue(message);
      return;
    }
    
    // Admin commands (only if user is admin)
    if (isAdmin) {
      // Show open reports
      if (lowerMessage.includes('show') && 
          (lowerMessage.includes('open') || lowerMessage.includes('pending'))) {
        await handleShowOpenReports();
        return;
      }
      
      // Mark report as done/resolved
      if (lowerMessage.includes('mark') && 
          lowerMessage.includes('id') && 
          (lowerMessage.includes('done') || lowerMessage.includes('resolved'))) {
        const matches = lowerMessage.match(/id\s*(\d+)/i);
        if (matches && matches[1]) {
          await handleMarkAsResolved(matches[1]);
          return;
        }
      }
    }
    
    // FAQ handling
    if (handleFAQ(lowerMessage)) {
      return;
    }
    
    // Unknown command
    addMessage("I'm not sure what you're asking. Here are some suggestions:", 'bot');
    setSuggestedActions([
      { label: 'Help', action: 'help' },
      { label: 'Report Issue', action: 'I want to report an issue' },
      { label: 'Check Status', action: 'Check status of my report' }
    ]);
  };

  const handleHelpCommand = () => {
    let helpMessage = `
Here's what I can help you with:

1. **Report Issues**: Tell me about problems like "There's a pothole on MG Road" or "The streetlight is broken near City Park"

2. **Check Status**: Ask "What's the status of ID 12?" to check on a report

3. **FAQs**:
   - "What is this project?"
   - "How do I report an issue?"
   - "What's the status process?"
   - "Who can use this app?"`;

    if (isAdmin) {
      helpMessage += `\n\n4. **Admin Commands**:
   - "Show open reports"
   - "Mark ID 12 as resolved"`;
    }

    addMessage(helpMessage, 'bot');
    
    setSuggestedActions([
      { label: 'Report Issue', action: 'I want to report an issue' },
      { label: 'Check Status', action: 'Check status of my report' },
      { label: 'What is this project?', action: 'What is this project?' }
    ]);
  };

  const handleStatusCheck = async (reportId: string) => {
    try {
      const report = await fetchReportById(`report-${reportId}`);
      
      if (!report) {
        addMessage(`I couldn't find any report with ID ${reportId}. Please check the ID and try again.`, 'bot');
        return;
      }
      
      const reportUrl = `/report/report-${reportId}`;
      const statusMessage = `
Report ID: ${reportId}
Type: ${report.type.replace('_', ' ')}
Status: ${report.status.replace('_', ' ')}
Priority: ${report.priority}
Reported on: ${new Date(report.createdAt).toLocaleDateString()}

You can view the full details here: [Report Details](/report/report-${reportId})`;

      addMessage(statusMessage, 'bot');
      
      setSuggestedActions([
        { label: 'View Details', action: `navigate:${reportUrl}` }
      ]);
    } catch (error) {
      console.error('Error fetching report:', error);
      addMessage('Sorry, I encountered an error while checking the status. Please try again later.', 'bot');
    }
  };

  const handleReportIssue = (message: string) => {
    // Try to detect issue type
    let detectedType: ReportType = 'other';
    
    if (message.toLowerCase().includes('pothole')) {
      detectedType = 'pothole';
    } else if (message.toLowerCase().includes('water') || message.toLowerCase().includes('leak')) {
      detectedType = 'water_leak';
    } else if (message.toLowerCase().includes('street light') || message.toLowerCase().includes('streetlight')) {
      detectedType = 'street_light';
    } else if (message.toLowerCase().includes('graffiti')) {
      detectedType = 'graffiti';
    } else if (message.toLowerCase().includes('trash') || message.toLowerCase().includes('garbage')) {
      detectedType = 'trash';
    } else if (message.toLowerCase().includes('sidewalk')) {
      detectedType = 'sidewalk';
    } else if (message.toLowerCase().includes('traffic light')) {
      detectedType = 'traffic_light';
    } else if (message.toLowerCase().includes('emergency')) {
      detectedType = 'emergency';
    }
    
    const responseMessage = `I understand you want to report a ${detectedType.replace('_', ' ')} issue. 
    
Would you like to submit a detailed report with photos and location? Click the button below to go to the report form.`;
    
    addMessage(responseMessage, 'bot');
    
    setSuggestedActions([
      { label: 'Go to Report Form', action: 'navigate:/report' }
    ]);
  };

  const handleShowOpenReports = async () => {
    if (!isAdmin) {
      addMessage('Sorry, only administrators can access this feature.', 'bot');
      return;
    }
    
    try {
      const openReports = await fetchFilteredReports('pending');
      
      if (openReports.length === 0) {
        addMessage('There are currently no open reports.', 'bot');
        return;
      }
      
      let responseMessage = `There are ${openReports.length} open reports:\n\n`;
      
      openReports.slice(0, 5).forEach(report => {
        const reportId = report.id.replace('report-', '');
        responseMessage += `ID ${reportId}: ${report.type.replace('_', ' ')} - ${report.priority} priority - ${new Date(report.createdAt).toLocaleDateString()}\n`;
      });
      
      if (openReports.length > 5) {
        responseMessage += `\n...and ${openReports.length - 5} more reports.`;
      }
      
      responseMessage += '\n\nYou can view all reports in the admin dashboard.';
      
      addMessage(responseMessage, 'bot');
      
      setSuggestedActions([
        { label: 'Go to Admin Dashboard', action: 'navigate:/admin' }
      ]);
    } catch (error) {
      console.error('Error fetching open reports:', error);
      addMessage('Sorry, I encountered an error while fetching open reports. Please try again later.', 'bot');
    }
  };

  const handleMarkAsResolved = async (reportId: string) => {
    if (!isAdmin) {
      addMessage('Sorry, only administrators can access this feature.', 'bot');
      return;
    }
    
    try {
      const report = await updateReportStatus(`report-${reportId}`, 'resolved');
      
      if (!report) {
        addMessage(`I couldn't find any report with ID ${reportId}. Please check the ID and try again.`, 'bot');
        return;
      }
      
      addMessage(`Report ID ${reportId} has been marked as resolved.`, 'bot');
      
      setSuggestedActions([
        { label: 'View Report', action: `navigate:/report/report-${reportId}` },
        { label: 'Admin Dashboard', action: 'navigate:/admin' }
      ]);
    } catch (error) {
      console.error('Error updating report status:', error);
      addMessage('Sorry, I encountered an error while updating the report. Please try again later.', 'bot');
    }
  };

  const handleFAQ = (message: string): boolean => {
    // What is this project?
    if (message.includes('what is this') || message.includes('about this')) {
      addMessage(`This is the SmartCity Fix Portal, an AI-powered solution for reporting and tracking urban infrastructure issues. 

It allows citizens to report problems like potholes, water leaks, or street light outages using their smartphones. The system uses AI to analyze reports, detect duplicates, and prioritize urgent issues.

This project was developed as part of the Smart India Hackathon (SIH) initiative to improve urban infrastructure management through technology.`, 'bot');
      return true;
    }
    
    // How do I report an issue?
    if (message.includes('how') && message.includes('report')) {
      addMessage(`To report an issue:

1. Click on "Report" in the navigation menu
2. Take or upload photos of the problem
3. Choose the issue type (pothole, water leak, etc.)
4. Mark the location on the map
5. Add a description
6. Submit your report

You can also report by telling me about the issue directly here, and I'll guide you to the report form.`, 'bot');
      
      setSuggestedActions([
        { label: 'Go to Report Form', action: 'navigate:/report' }
      ]);
      return true;
    }
    
    // What's the status process?
    if (message.includes('status') && message.includes('process')) {
      addMessage(`The status process for reports follows these stages:

1. **Pending**: Initial report submitted
2. **Investigating**: Officials are assessing the report
3. **In Progress**: Work has begun to fix the issue
4. **Resolved**: The issue has been fixed

You can check a report's status by asking me "What's the status of ID [number]?" or by visiting the report details page.`, 'bot');
      return true;
    }
    
    // Who can use this?
    if (message.includes('who') && message.includes('use')) {
      addMessage(`This application is designed for:

1. **Citizens**: To report infrastructure issues in their neighborhoods
2. **Municipal Staff**: To track and manage reported issues
3. **Administrators**: To prioritize issues and coordinate responses

Anyone with internet access can report issues and check on their status. Administrative functions are restricted to authorized personnel.`, 'bot');
      return true;
    }
    
    return false;
  };

  const handleSuggestedAction = (action: string) => {
    if (action.startsWith('navigate:')) {
      const url = action.replace('navigate:', '');
      navigate(url);
      setIsOpen(false);
    } else {
      setInputValue(action);
      // Auto-send after a slight delay to show the user what was selected
      setTimeout(() => {
        handleSendMessage();
      }, 300);
    }
  };

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 flex items-center justify-center z-50 shadow-lg"
        size="icon"
      >
        <Bot size={24} />
      </Button>
      
      {/* Chat dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 md:p-12">
          <Card className="w-full max-w-md h-[80vh] flex flex-col shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between py-3 border-b">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <span>SmartCityBot</span>
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-auto p-4">
              <div className="space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                      <Avatar className={`h-8 w-8 ${message.sender === 'user' ? 'bg-primary' : 'bg-secondary'}`}>
                        {message.sender === 'user' ? (
                          <User className="h-4 w-4 text-primary-foreground" />
                        ) : (
                          <Bot className="h-4 w-4 text-secondary-foreground" />
                        )}
                        <AvatarFallback>
                          {message.sender === 'user' ? 'U' : 'B'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div
                        className={`rounded-lg px-3 py-2 whitespace-pre-wrap ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2 max-w-[80%]">
                      <Avatar className="h-8 w-8 bg-secondary">
                        <Bot className="h-4 w-4 text-secondary-foreground" />
                        <AvatarFallback>B</AvatarFallback>
                      </Avatar>
                      <div className="rounded-lg px-3 py-2 bg-muted">
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0ms]"></div>
                          <div className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:150ms]"></div>
                          <div className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:300ms]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {suggestedActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestedAction(action.action)}
                        className="flex items-center gap-1"
                      >
                        {action.action.includes('help') && <HelpCircle className="h-3 w-3" />}
                        {action.action.includes('report') && <AlertCircle className="h-3 w-3" />}
                        {action.action.includes('navigate') && <Sparkles className="h-3 w-3" />}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            
            <CardFooter className="border-t p-3">
              <form 
                className="flex w-full gap-2" 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  size="icon"
                  disabled={!inputValue.trim() || isProcessing}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
};

export default SmartCityBot;
