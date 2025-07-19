
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Check, Upload, Link, Images } from 'lucide-react';

interface ImageSelectorProps {
  selectedImage: string;
  onImageSelect: (url: string) => void;
}

const preUploadedImages = [
  {
    id: 'business-1',
    url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
    name: 'Business Meeting'
  },
  {
    id: 'product-1', 
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    name: 'Shopping'
  },
  {
    id: 'food-1',
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    name: 'Pizza'
  },
  {
    id: 'tech-1',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
    name: 'Technology'
  },
  {
    id: 'service-1',
    url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
    name: 'Customer Service'
  },
  {
    id: 'delivery-1',
    url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop',
    name: 'Delivery'
  }
];

type ImageOptionType = 'upload' | 'preselect' | 'url' | null;

export const ImageSelector: React.FC<ImageSelectorProps> = ({
  selectedImage,
  onImageSelect
}) => {
  const [selectedOption, setSelectedOption] = useState<ImageOptionType>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handlePreUploadedImageSelect = (url: string) => {
    onImageSelect(url);
    setIsDialogOpen(false);
  };

  const isPreUploadedImage = preUploadedImages.some(img => img.url === selectedImage);

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Header Image Options</Label>
      
      {/* Three Option Buttons */}
      <div className="grid grid-cols-1 gap-2">
        <Button
          type="button"
          variant={selectedOption === 'upload' ? 'default' : 'outline'}
          onClick={() => setSelectedOption(selectedOption === 'upload' ? null : 'upload')}
          className="justify-start"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload New Image
        </Button>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant={selectedOption === 'preselect' ? 'default' : 'outline'}
              onClick={() => setSelectedOption(selectedOption === 'preselect' ? null : 'preselect')}
              className="justify-start"
            >
              <Images className="w-4 h-4 mr-2" />
              Choose Pre-uploaded Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Choose from Pre-uploaded Images</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {preUploadedImages.map((image) => (
                <Card 
                  key={image.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedImage === image.url ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handlePreUploadedImageSelect(image.url)}
                >
                  <CardContent className="p-3">
                    <div className="relative">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-32 object-cover rounded"
                      />
                      {selectedImage === image.url && (
                        <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-center mt-2 text-gray-600">{image.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
        
        <Button
          type="button"
          variant={selectedOption === 'url' ? 'default' : 'outline'}
          onClick={() => setSelectedOption(selectedOption === 'url' ? null : 'url')}
          className="justify-start"
        >
          <Link className="w-4 h-4 mr-2" />
          Custom Image URL
        </Button>
      </div>

      {/* Show selected option content */}
      {selectedOption === 'upload' && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <Label className="text-sm">Upload Image File</Label>
          <Input
            type="file"
            accept="image/*"
            className="mt-2"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // For now, we'll create a local URL - in production you'd upload to Supabase storage
                const url = URL.createObjectURL(file);
                onImageSelect(url);
              }
            }}
          />
          <p className="text-xs text-gray-500 mt-1">
            Upload an image file from your device
          </p>
        </div>
      )}

      {selectedOption === 'url' && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <Label htmlFor="custom-image-url" className="text-sm">Custom Image URL</Label>
          <Input
            id="custom-image-url"
            value={!isPreUploadedImage ? selectedImage : ''}
            onChange={(e) => onImageSelect(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="mt-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter a direct URL to an image
          </p>
        </div>
      )}

      {/* Show current selection */}
      {selectedImage && (
        <div className="mt-4 p-3 border rounded-lg bg-blue-50">
          <Label className="text-sm font-medium text-blue-800">Current Selection:</Label>
          <div className="mt-2 flex items-center space-x-3">
            <img
              src={selectedImage}
              alt="Selected"
              className="w-16 h-12 object-cover rounded border"
            />
            <div className="flex-1">
              <p className="text-sm text-blue-700 break-all">
                {isPreUploadedImage 
                  ? preUploadedImages.find(img => img.url === selectedImage)?.name 
                  : selectedImage
                }
              </p>
              {isPreUploadedImage && (
                <p className="text-xs text-blue-600">Pre-uploaded image</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
