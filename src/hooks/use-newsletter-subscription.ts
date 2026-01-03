import { useState, useEffect, useRef } from "react";
import { publicEnv } from "~/utils/env-public";
import { subscribeToNewsletterFn } from "~/fn/newsletter";

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export function useNewsletterSubscription() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // Lazy load reCAPTCHA when element scrolls into view
  useEffect(() => {
    const container = containerRef.current;
    if (!container || recaptchaLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !scriptRef.current) {
          const script = document.createElement("script");
          script.src = `https://www.google.com/recaptcha/api.js?render=${publicEnv.VITE_RECAPTCHA_KEY}`;
          script.async = true;
          script.onload = () => setRecaptchaLoaded(true);
          document.head.appendChild(script);
          scriptRef.current = script;
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // Start loading slightly before it's visible
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [recaptchaLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await new Promise<void>((resolve, reject) => {
        window.grecaptcha.ready(function () {
          window.grecaptcha
            .execute(publicEnv.VITE_RECAPTCHA_KEY, { action: "submit" })
            .then(async function (token: string) {
              try {
                await subscribeToNewsletterFn({
                  data: {
                    email,
                    recaptchaToken: token,
                    subscriptionType: "waitlist",
                    source: "early_access",
                  },
                });
                setIsSubmitted(true);
                resolve();
              } catch (error) {
                reject(error);
              }
            })
            .catch(reject);
        });
      });
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      setError("Failed to subscribe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    isSubmitted,
    isLoading,
    error,
    handleSubmit,
    containerRef,
  };
}
