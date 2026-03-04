import { useState } from "react";
import type { SoulBlueprintInput } from "@/types/cosmic";

interface BlueprintWizardProps {
  onComplete: () => void;
  isLoading: boolean;
  error: string | null;
  onSubmit: (data: SoulBlueprintInput) => void;
}

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "India",
  "Germany",
  "France",
  "Japan",
  "Brazil",
  "Mexico",
  "China",
  "South Korea",
  "Italy",
  "Spain",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Switzerland",
  "Ireland",
  "New Zealand",
  "South Africa",
  "Nigeria",
  "Argentina",
  "Colombia",
  "Philippines",
  "Thailand",
  "Vietnam",
  "Indonesia",
  "Malaysia",
  "Singapore",
  "Portugal",
  "Poland",
  "Belgium",
  "Austria",
  "Czech Republic",
  "Greece",
  "Turkey",
  "Egypt",
  "Israel",
  "United Arab Emirates",
  "Saudi Arabia",
  "Pakistan",
  "Bangladesh",
  "Russia",
  "Ukraine",
  "Romania",
  "Hungary",
  "Chile",
  "Peru",
  "Kenya",
  "Ghana",
  "Ethiopia",
  "Tanzania",
  "Other",
];

export default function BlueprintWizard({
  isLoading,
  error,
  onSubmit,
}: BlueprintWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    birthDate: "",
    birthTime: "",
    birthCity: "",
    birthCountry: "",
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const totalSteps = 3;

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationError(null);
  };

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!formData.fullName.trim()) {
        setValidationError("Please enter your full name.");
        return false;
      }
      if (!formData.birthDate) {
        setValidationError("Please select your birth date.");
        return false;
      }
    }
    if (step === 2) {
      if (!formData.birthTime) {
        setValidationError("Please enter your birth time.");
        return false;
      }
      if (!formData.birthCity.trim()) {
        setValidationError("Please enter your birth city.");
        return false;
      }
      if (!formData.birthCountry) {
        setValidationError("Please select your birth country.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, totalSteps));
  };

  const handleBack = () => {
    setValidationError(null);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = () => {
    onSubmit({
      fullName: formData.fullName.trim(),
      birthDate: formData.birthDate,
      birthTime: formData.birthTime,
      birthCity: formData.birthCity.trim(),
      birthCountry: formData.birthCountry,
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-3 mb-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                s < step
                  ? "bg-purple-600 text-white"
                  : s === step
                    ? "bg-purple-600 text-white ring-4 ring-purple-600/30"
                    : "bg-gray-800 text-gray-500 border border-gray-700"
              }`}
            >
              {s < step ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                s
              )}
            </div>
            {s < 3 && (
              <div
                className={`w-16 h-0.5 ${s < step ? "bg-purple-600" : "bg-gray-700"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="text-center mb-8">
        <p className="text-sm text-purple-400 font-medium uppercase tracking-wider">
          Step {step} of {totalSteps}
        </p>
        <h2 className="text-2xl font-bold text-white mt-1">
          {step === 1 && "Your Identity"}
          {step === 2 && "Birth Details"}
          {step === 3 && "Review & Create"}
        </h2>
        <p className="text-gray-400 mt-2 text-sm">
          {step === 1 && "Tell us your name and when you were born."}
          {step === 2 && "Help us pinpoint the stars at the moment of your birth."}
          {step === 3 && "Confirm your details to generate your Soul Blueprint."}
        </p>
      </div>

      {/* Error Display */}
      {(validationError || error) && (
        <div className="mb-6 rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
          {validationError || error}
        </div>
      )}

      {/* Form Card */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm p-6">
        {/* Step 1: Name + Birth Date */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="birthDate"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Birth Date
              </label>
              <input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => updateField("birthDate", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-colors [color-scheme:dark]"
              />
            </div>
          </div>
        )}

        {/* Step 2: Birth Time + Place */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label
                htmlFor="birthTime"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Birth Time
              </label>
              <input
                id="birthTime"
                type="time"
                value={formData.birthTime}
                onChange={(e) => updateField("birthTime", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-colors [color-scheme:dark]"
              />
              <p className="text-xs text-gray-500 mt-1">
                If unknown, use 12:00 PM as an approximation.
              </p>
            </div>
            <div>
              <label
                htmlFor="birthCity"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Birth City
              </label>
              <input
                id="birthCity"
                type="text"
                value={formData.birthCity}
                onChange={(e) => updateField("birthCity", e.target.value)}
                placeholder="e.g. New York"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="birthCountry"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Birth Country
              </label>
              <select
                id="birthCountry"
                value={formData.birthCountry}
                onChange={(e) => updateField("birthCountry", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-colors appearance-none"
              >
                <option value="">Select a country</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Name
                </p>
                <p className="text-white font-medium mt-1">
                  {formData.fullName}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Birth Date
                </p>
                <p className="text-white font-medium mt-1">
                  {formData.birthDate}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Birth Time
                </p>
                <p className="text-white font-medium mt-1">
                  {formData.birthTime}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Birth City
                </p>
                <p className="text-white font-medium mt-1">
                  {formData.birthCity}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Birth Country
                </p>
                <p className="text-white font-medium mt-1">
                  {formData.birthCountry}
                </p>
              </div>
            </div>
            <div className="mt-2 rounded-lg bg-purple-900/20 border border-purple-800/30 p-3">
              <p className="text-sm text-purple-300">
                Your Soul Blueprint will reveal your Life Path Number, zodiac
                signs, Chinese zodiac, and planetary ruler based on these
                details.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            disabled={isLoading}
            className="px-6 py-3 rounded-lg font-medium text-gray-300 border border-gray-700 hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Back
          </button>
        ) : (
          <div />
        )}

        {step < totalSteps ? (
          <button
            type="button"
            onClick={handleNext}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-6 py-3 font-medium transition-colors"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-6 py-3 font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Creating...
              </>
            ) : (
              "Create My Soul Blueprint"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
