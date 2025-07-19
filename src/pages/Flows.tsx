import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Play, Copy, MoreHorizontal } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useChatbotFlow } from '@/hooks/useChatbotFlow';
import { useToast } from '@/hooks/use-toast';
import type { ChatbotFlow } from '@/types/chatbot';

const Flows = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { flows, loadFlows, saveFlow } = useChatbotFlow();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<ChatbotFlow | null>(null);
  const [newFlow, setNewFlow] = useState({
    name: '',
    description: '',
    triggerType: 'keyword' as 'keyword' | 'button' | 'webhook',
    keywords: '',
  });

  useEffect(() => {
    loadFlows();
  }, [loadFlows]);

  const filteredFlows = flows.filter(flow =>
    flow.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateFlow = async () => {
    if (!newFlow.name.trim()) {
      toast({
        title: "Error",
        description: "Flow name is required",
        variant: "destructive",
      });
      return;
    }

    const flowData = {
      name: newFlow.name,
      trigger: {
        type: newFlow.triggerType,
        keywords: newFlow.keywords ? newFlow.keywords.split(',').map(k => k.trim()) : [],
        exact_match: false,
      },
      nodes: [],
      edges: [],
      variables: [],
      status: 'inactive' as const,
    };

    const savedFlow = await saveFlow(flowData);
    if (savedFlow) {
      setIsCreateDialogOpen(false);
      setNewFlow({ name: '', description: '', triggerType: 'keyword', keywords: '' });
      loadFlows();
      toast({
        title: "Success",
        description: "Flow created successfully",
      });
      // Redirect to chatbot builder with the new flow ID
      navigate(`/chatbot-builder?flowId=${savedFlow.id}`);
    }
  };

  const handleDeleteFlow = async () => {
    if (!selectedFlow) return;
    
    // TODO: Implement delete functionality
    toast({
      title: "Info",
      description: "Delete functionality will be implemented soon",
    });
    setIsDeleteDialogOpen(false);
    setSelectedFlow(null);
  };

  const handleDuplicateFlow = async (flow: ChatbotFlow) => {
    const duplicatedFlow = {
      ...flow,
      name: `${flow.name} (Copy)`,
      status: 'inactive' as const,
    };
    
    delete (duplicatedFlow as any).id;
    delete (duplicatedFlow as any).created_at;
    delete (duplicatedFlow as any).updated_at;

    await saveFlow(duplicatedFlow);
    loadFlows();
    toast({
      title: "Success",
      description: "Flow duplicated successfully",
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getTriggerDescription = (trigger: any) => {
    if (trigger.type === 'keyword') {
      return trigger.keywords?.length > 0 
        ? `Keywords: ${trigger.keywords.join(', ')}` 
        : 'No keywords set';
    }
    return `Trigger: ${trigger.type}`;
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chatbot Flows</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage your automated conversation flows
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Flow
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search flows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="secondary" className="text-sm">
            {filteredFlows.length} flows
          </Badge>
        </div>

        {/* Flows Grid */}
        {filteredFlows.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No flows found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No flows match your search criteria.' : 'Get started by creating your first chatbot flow.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Flow
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFlows.map((flow) => (
              <Card key={flow.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{flow.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {getTriggerDescription(flow.trigger)}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/chatbot-builder?flowId=${flow.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateFlow(flow)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedFlow(flow);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(flow.status)}>
                      {flow.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {flow.nodes?.length || 0} blocks
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Updated {new Date(flow.updated_at).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-2"
                      onClick={() => navigate(`/chatbot-builder?flowId=${flow.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      disabled={flow.status === 'inactive'}
                    >
                      <Play className="h-4 w-4" />
                      Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Flow Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Flow</DialogTitle>
              <DialogDescription>
                Set up your new chatbot flow with basic configuration.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Flow Name</Label>
                <Input
                  id="name"
                  value={newFlow.name}
                  onChange={(e) => setNewFlow({ ...newFlow, name: e.target.value })}
                  placeholder="Enter flow name..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="trigger">Trigger Type</Label>
                <Select
                  value={newFlow.triggerType}
                  onValueChange={(value: 'keyword' | 'button' | 'webhook') =>
                    setNewFlow({ ...newFlow, triggerType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keyword">Keywords</SelectItem>
                    <SelectItem value="button">Button</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newFlow.triggerType === 'keyword' && (
                <div className="grid gap-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    value={newFlow.keywords}
                    onChange={(e) => setNewFlow({ ...newFlow, keywords: e.target.value })}
                    placeholder="hello, hi, start (comma separated)"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFlow}>Create Flow</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Flow</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedFlow?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteFlow}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Flows;
