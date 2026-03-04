import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BlueprintWizard from "../components/SoulBlueprint/BlueprintWizard";
import BlueprintSummary from "../components/SoulBlueprint/BlueprintSummary";
import apiClient from "@/lib/api-client";
import type {
  SoulBlueprint as SoulBlueprintType,
  SoulBlueprintInput,
} from "@/types/cosmic";

export default function SoulBlueprint() {
  const navigate = useNavigate();
  const [blueprint, setBlueprint] = useState<SoulBlueprintType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: SoulBlueprintInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/soul-blueprint", data);
      setBlueprint(response.data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create Soul Blueprint.";
      // Try to extract API error message
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as Record<string, unknown>).response === "object"
      ) {
        const resp = (err as { response?: { data?: { error?: string } } })
          .response;
        if (resp?.data?.error) {
          setError(resp.data.error);
          return;
        }
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Cosmic Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-800/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Soul Blueprint
          </h1>
          <p className="text-gray-400 mt-2 max-w-md mx-auto">
            Discover your cosmic identity and unlock personalized trading
            insights aligned with the stars.
          </p>
        </div>

        {/* Show wizard or summary */}
        {blueprint ? (
          <BlueprintSummary
            blueprint={blueprint}
            onContinue={handleContinue}
          />
        ) : (
          <BlueprintWizard
            onComplete={handleContinue}
            isLoading={isLoading}
            error={error}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
