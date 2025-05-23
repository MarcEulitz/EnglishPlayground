import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Eye, Wand2, AlertTriangle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ValidationResult {
  word: string;
  validation: {
    isValid: boolean;
    confidence: number;
    reasoning: string;
    childFriendly: boolean;
    suggestedReplacement?: string;
  };
  newImageUrl?: string;
}

interface ImageValidatorProps {
  category: string;
  vocabularyItems: Array<{ word: string; translation: string; imageUrl: string }>;
  onImageUpdated?: (word: string, newImageUrl: string) => void;
}

export default function ImageValidator({ category, vocabularyItems, onImageUpdated }: ImageValidatorProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const validateAllImages = async () => {
    setIsValidating(true);
    setProgress(0);
    setValidationResults([]);

    try {
      const response = await apiRequest<ValidationResult[]>('/api/validate-category', {
        method: 'POST',
        body: JSON.stringify({
          vocabularyItems,
          category
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setValidationResults(response);
      
      // Automatisch bessere Bilder verwenden
      const updatedImages = response.filter(result => result.newImageUrl);
      
      if (updatedImages.length > 0) {
        updatedImages.forEach(result => {
          if (result.newImageUrl && onImageUpdated) {
            onImageUpdated(result.word, result.newImageUrl);
          }
        });
        
        toast({
          title: "Bilder automatisch verbessert! 🎉",
          description: `${updatedImages.length} unpassende Bilder wurden durch bessere ersetzt.`,
        });
      } else {
        toast({
          title: "Alle Bilder sind in Ordnung! ✅",
          description: "Keine problematischen Bilder gefunden.",
        });
      }

    } catch (error: any) {
      console.error('Validierung fehlgeschlagen:', error);
      
      if (error.message?.includes('API Key')) {
        toast({
          title: "OpenAI API Key benötigt 🔑",
          description: "Bitte OpenAI API Key einrichten für die intelligente Bildprüfung.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Validierung fehlgeschlagen",
          description: "Es gab ein Problem bei der Bildprüfung.",
          variant: "destructive"
        });
      }
    } finally {
      setIsValidating(false);
      setProgress(100);
    }
  };

  const validateSingleImage = async (imageUrl: string, word: string, translation: string) => {
    try {
      const response = await apiRequest('/api/validate-image', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl,
          englishWord: word,
          germanTranslation: translation,
          category
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error('Einzelbild-Validierung fehlgeschlagen:', error);
      throw error;
    }
  };

  const findBetterImage = async (word: string, translation: string) => {
    try {
      const response = await apiRequest('/api/find-better-image', {
        method: 'POST',
        body: JSON.stringify({
          englishWord: word,
          germanTranslation: translation,
          category
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.imageUrl && onImageUpdated) {
        onImageUpdated(word, response.imageUrl);
        toast({
          title: `Besseres Bild für "${word}" gefunden! 🎯`,
          description: "Das Bild wurde automatisch aktualisiert.",
        });
      }

    } catch (error) {
      toast({
        title: "Kein besseres Bild gefunden",
        description: `Für "${word}" konnte kein besseres Bild gefunden werden.`,
        variant: "destructive"
      });
    }
  };

  const getValidationIcon = (isValid: boolean, childFriendly: boolean) => {
    if (isValid && childFriendly) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Intelligente Bildprüfung
        </CardTitle>
        <CardDescription>
          Überprüft automatisch alle Bilder mit KI und ersetzt unpassende durch bessere.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={validateAllImages}
            disabled={isValidating}
            className="flex items-center gap-2"
          >
            <Wand2 className="h-4 w-4" />
            {isValidating ? 'Prüfe alle Bilder...' : `Alle ${vocabularyItems.length} Bilder prüfen`}
          </Button>
        </div>

        {isValidating && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Analysiere Bilder mit OpenAI Vision API...
            </p>
          </div>
        )}

        {validationResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Prüfungsergebnisse:</h3>
            
            <div className="grid gap-3">
              {validationResults.map((result) => (
                <Card key={result.word} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getValidationIcon(result.validation.isValid, result.validation.childFriendly)}
                      
                      <div>
                        <div className="font-medium">{result.word}</div>
                        <div className="text-sm text-muted-foreground">
                          {result.validation.reasoning}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={result.validation.isValid && result.validation.childFriendly ? 'default' : 'destructive'}
                      >
                        {Math.round(result.validation.confidence * 100)}% sicher
                      </Badge>
                      
                      {result.newImageUrl && (
                        <Badge variant="secondary">
                          ✅ Ersetzt
                        </Badge>
                      )}
                      
                      {!result.validation.isValid && !result.newImageUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => findBetterImage(result.word, vocabularyItems.find(v => v.word === result.word)?.translation || '')}
                        >
                          Besseres Bild finden
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Zusammenfassung:</span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {validationResults.filter(r => r.validation.isValid && r.validation.childFriendly).length} von {validationResults.length} Bilder sind perfekt geeignet.
                {validationResults.filter(r => r.newImageUrl).length > 0 && 
                  ` ${validationResults.filter(r => r.newImageUrl).length} Bilder wurden automatisch verbessert.`
                }
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}