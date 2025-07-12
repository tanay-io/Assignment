"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { getToken, getUser, logout } from "@/lib/auth";
import {
  FileText,
  Brain,
  Target,
  ChevronLeft,
  AlertCircle,
  Loader2,
  Calendar,
  Download,
  Copy,
  CheckCircle,
  File,
} from "lucide-react";

interface IGenerationDetail {
  _id: string;
  originalContent: string;
  generatedContent: string;
  fileName: string;
  generationType: string;
  userGivenName?: string;
  uploadDate: string;
  originalFileUrl: string;
  userId: string;
}

const getGenerationIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "summary":
      return FileText;
    case "flashcards":
      return Brain;
    case "key_points":
      return Target;
    default:
      return FileText;
  }
};

const getGenerationColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "summary":
      return {
        bg: "bg-blue-50 dark:bg-blue-950/50",
        border: "border-blue-200 dark:border-blue-800",
        text: "text-blue-700 dark:text-blue-300",
        gradient: "from-blue-500 to-cyan-500",
      };
    case "flashcards":
      return {
        bg: "bg-purple-50 dark:bg-purple-950/50",
        border: "border-purple-200 dark:border-purple-800",
        text: "text-purple-700 dark:text-purple-300",
        gradient: "from-purple-500 to-pink-500",
      };
    case "key_points":
      return {
        bg: "bg-green-50 dark:bg-green-950/50",
        border: "border-green-200 dark:border-green-800",
        text: "text-green-700 dark:text-green-300",
        gradient: "from-green-500 to-emerald-500",
      };
    default:
      return {
        bg: "bg-gray-50 dark:bg-gray-900/50",
        border: "border-gray-200 dark:border-gray-700",
        text: "text-gray-700 dark:text-gray-300",
        gradient: "from-gray-500 to-slate-500",
      };
  }
};

export default function GenerationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [generation, setGeneration] = useState<IGenerationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.push("/auth/signin");
      return;
    }
    if (!id) return;
    async function fetchGenerationDetails() {
      setIsLoading(true);
      setError(null);
      try {
        const user = getUser();
        const userId = user?.id;
        if (!userId) throw new Error("User ID not found in local storage.");
        const res = await fetch(
          `http://localhost:5000/generations/${id}?userId=${userId}`,
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          }
        );
        if (!res.ok) {
          if (res.status === 403) {
            throw new Error(
              "You do not have permission to view this generation."
            );
          }
          throw new Error("Failed to fetch generation details.");
        }
        const data = await res.json();
        setGeneration(data.generation);
      } catch (err) {
        console.error("Error fetching generation details:", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred."
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchGenerationDetails();
  }, [id, router]);

  const copyToClipboard = async () => {
    if (!generation) return;

    try {
      await navigator.clipboard.writeText(generation.generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <Link href="/dashboard" passHref>
            <Button
              variant="outline"
              className="rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-sm"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          {/* Loading State */}
          {isLoading && (
            <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
              <CardHeader>
                <Skeleton className="h-8 w-3/4 rounded-lg" />
                <div className="space-y-3 mt-4">
                  <Skeleton className="h-4 w-1/2 rounded-lg" />
                  <Skeleton className="h-4 w-2/3 rounded-lg" />
                  <Skeleton className="h-4 w-1/3 rounded-lg" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full rounded-lg" />
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-700 dark:text-red-300 font-medium">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Generation Detail */}
          {!isLoading && !error && generation && (
            <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
              {(() => {
                const Icon = getGenerationIcon(generation.generationType);
                const colors = getGenerationColor(generation.generationType);

                return (
                  <>
                    <CardHeader
                      className={`${colors.bg} rounded-t-xl border-b ${colors.border}`}
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                          <Icon className={`h-6 w-6 ${colors.text}`} />
                        </div>
                        <CardTitle className="text-2xl text-gray-900 dark:text-white">
                          {generation.userGivenName ||
                            `Generated ${generation.generationType}`}
                        </CardTitle>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge
                              className={`${colors.bg} ${colors.border} ${colors.text} capitalize`}
                            >
                              {generation.generationType}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                            <File className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                            <span className="truncate">
                              {generation.fileName}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <Calendar className="h-3 w-3 mr-2" />
                            {format(
                              new Date(generation.uploadDate),
                              "MMMM dd, yyyy 'at' HH:mm"
                            )}
                          </p>
                        </div>

                        {generation.originalFileUrl && (
                          <div className="flex items-center justify-end">
                            <a
                              href={generation.originalFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                className={`rounded-xl bg-gradient-to-r ${colors.gradient} text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]`}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                View Original File
                              </Button>
                            </a>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="p-8 space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Generated Content
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copyToClipboard}
                            className="rounded-lg"
                          >
                            {copied ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Text
                              </>
                            )}
                          </Button>
                        </div>
                        <Textarea
                          readOnly
                          value={generation.generatedContent}
                          rows={12}
                          className="w-full font-mono text-sm resize-none border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-gray-50 dark:bg-gray-800"
                        />
                      </div>
                    </CardContent>
                  </>
                );
              })()}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
