
import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CampaignSchedulerProps {
  onSchedule: (scheduledDate: Date) => void;
  onSendNow: () => void;
  loading: boolean;
}

export const CampaignScheduler: React.FC<CampaignSchedulerProps> = ({
  onSchedule,
  onSendNow,
  loading
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now');

  const handleSchedule = () => {
    if (!selectedDate) return;
    
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(hours, minutes, 0, 0);
    
    onSchedule(scheduledDateTime);
  };

  const isScheduleValid = scheduleMode === 'now' || (selectedDate && selectedTime);
  const isPastDateTime = selectedDate && new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), ...selectedTime.split(':').map(Number)) <= new Date();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Campaign Execution</h3>
        <div className="grid grid-cols-2 gap-4">
          <Card 
            className={cn(
              "cursor-pointer border-2 transition-colors",
              scheduleMode === 'now' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            )}
            onClick={() => setScheduleMode('now')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Send Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Campaign will be sent immediately
              </p>
            </CardContent>
          </Card>

          <Card 
            className={cn(
              "cursor-pointer border-2 transition-colors",
              scheduleMode === 'later' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            )}
            onClick={() => setScheduleMode('later')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Later
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Choose a specific date and time
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {scheduleMode === 'later' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Select Time</Label>
              <Input
                id="time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>
          </div>

          {selectedDate && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Scheduled for:</strong> {format(selectedDate, 'PPPP')} at {selectedTime}
              </p>
            </div>
          )}

          {isPastDateTime && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                ⚠️ The selected date and time is in the past. Please choose a future date and time.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end">
        {scheduleMode === 'now' ? (
          <Button 
            onClick={onSendNow}
            disabled={loading}
            className="whatsapp-green hover:bg-green-600"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Sending...
              </>
            ) : (
              'Send Campaign Now'
            )}
          </Button>
        ) : (
          <Button 
            onClick={handleSchedule}
            disabled={loading || !isScheduleValid || isPastDateTime}
            className="whatsapp-green hover:bg-green-600"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Scheduling...
              </>
            ) : (
              'Schedule Campaign'
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
