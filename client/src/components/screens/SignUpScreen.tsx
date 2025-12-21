import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, User, MapPin, Camera, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { SiGoogle, SiApple } from "react-icons/si";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type SignUpStep = 'auth' | 'verify' | 'profile' | 'location';

interface SignUpScreenProps {
  onComplete: (userData: { name: string; avatar?: string; userId?: string }) => void;
}

export default function SignUpScreen({ onComplete }: SignUpScreenProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<SignUpStep>('auth');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    name: '',
    avatar: '',
  });

  const sendCodeMutation = useMutation({
    mutationFn: async (data: { identifier: string; type: 'email' | 'phone' }) => {
      const response = await apiRequest('POST', '/api/auth/send-code', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Code Sent",
        description: `Check your ${authMethod === 'email' ? 'email inbox' : 'phone'} for the verification code.`
      });
      setStep('verify');
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send Code",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    }
  });

  const verifyCodeMutation = useMutation({
    mutationFn: async (data: { identifier: string; code: string; type: 'email' | 'phone' }) => {
      const response = await apiRequest('POST', '/api/auth/verify-code', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.user) {
        setUserId(data.user.id);
        if (data.user.name) {
          setFormData(prev => ({ ...prev, name: data.user.name }));
        }
      }
      toast({
        title: "Verified",
        description: "Your account has been verified."
      });
      setStep('profile');
    },
    onError: (error: Error) => {
      toast({
        title: "Invalid Code",
        description: error.message || "The code is incorrect or expired.",
        variant: "destructive"
      });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: { name: string; avatar?: string }) => {
      if (!userId) throw new Error("User ID not found");
      const response = await apiRequest('PATCH', `/api/auth/user/${userId}`, data);
      return response.json();
    },
    onSuccess: () => {
      setStep('location');
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Profile",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSocialLogin = (provider: string) => {
    toast({
      title: `${provider} Sign In`,
      description: `${provider} authentication will be connected soon.`
    });
    setStep('profile');
  };

  const handleSendCode = () => {
    const identifier = authMethod === 'email' ? formData.email : formData.phone;
    if (!identifier) {
      toast({
        title: "Missing Information",
        description: `Please enter your ${authMethod === 'email' ? 'email address' : 'phone number'}.`,
        variant: "destructive"
      });
      return;
    }

    if (authMethod === 'email' && !formData.email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    sendCodeMutation.mutate({ identifier, type: authMethod! });
  };

  const handleVerifyCode = () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit code.",
        variant: "destructive"
      });
      return;
    }

    const identifier = authMethod === 'email' ? formData.email : formData.phone;
    verifyCodeMutation.mutate({ identifier, code: verificationCode, type: authMethod! });
  };

  const handleProfileSubmit = () => {
    if (!formData.name) {
      toast({
        title: "Missing Name",
        description: "Please enter your name.",
        variant: "destructive"
      });
      return;
    }
    updateUserMutation.mutate({ name: formData.name, avatar: formData.avatar || undefined });
  };

  const handleLocationPermission = (granted: boolean) => {
    if (granted) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => {
            toast({
              title: "Location Enabled",
              description: "We'll show you events nearby."
            });
            onComplete({ name: formData.name, avatar: formData.avatar, userId: userId || undefined });
          },
          () => {
            toast({
              title: "Location Denied",
              description: "You can enable this later in settings."
            });
            onComplete({ name: formData.name, avatar: formData.avatar, userId: userId || undefined });
          }
        );
      } else {
        toast({
          title: "Location Unavailable",
          description: "Location services are not supported on this device."
        });
        onComplete({ name: formData.name, avatar: formData.avatar, userId: userId || undefined });
      }
    } else {
      onComplete({ name: formData.name, avatar: formData.avatar, userId: userId || undefined });
    }
  };

  const handleResendCode = () => {
    const identifier = authMethod === 'email' ? formData.email : formData.phone;
    sendCodeMutation.mutate({ identifier, type: authMethod! });
  };

  const getSteps = () => ['auth', 'verify', 'profile', 'location'];
  const currentStepIndex = getSteps().indexOf(step);

  return (
    <div 
      className="h-screen w-full flex flex-col p-6"
      style={{
        background: 'var(--app-gradient)'
      }}
      data-testid="screen-signup"
    >
      <div className="text-center mb-8 pt-8">
        <h1 className="font-display text-2xl font-bold text-theme-highlight glow-text-gold">
          Grid Way
        </h1>
        <p className="text-theme-text-muted mt-2 text-sm">
          {step === 'auth' && 'Join the experience'}
          {step === 'verify' && 'Enter verification code'}
          {step === 'profile' && 'Create your profile'}
          {step === 'location' && 'Find events nearby'}
        </p>
      </div>

      <div className="flex gap-2 justify-center mb-8">
        {getSteps().map((s, i) => (
          <div
            key={s}
            className={`h-1 w-12 rounded-full transition-all ${
              s === step ? 'bg-theme-highlight glow-border-gold' : 
              currentStepIndex > i ? 'bg-theme-accent' : 'bg-theme-card'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col">
        {step === 'auth' && (
          <div className="space-y-4 animate-fadeIn">
            {!authMethod && (
              <>
                <Button
                  variant="outline"
                  className="w-full border-theme-accent/50 text-theme-text font-display gap-2"
                  onClick={() => handleSocialLogin('Google')}
                  data-testid="button-google-login"
                >
                  <SiGoogle className="w-5 h-5 text-[#4285F4]" />
                  Continue with Google
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full border-theme-accent/50 text-theme-text font-display gap-2"
                  onClick={() => handleSocialLogin('Apple')}
                  data-testid="button-apple-login"
                >
                  <SiApple className="w-5 h-5" />
                  Continue with Apple
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-theme-accent/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-theme-surface px-2 text-theme-text-muted">or</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-theme-accent/50 text-theme-accent font-display gap-2"
                  onClick={() => setAuthMethod('email')}
                  data-testid="button-email-option"
                >
                  <Mail className="w-5 h-5" />
                  Sign up with Email
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-theme-accent/50 text-theme-accent font-display gap-2"
                  onClick={() => setAuthMethod('phone')}
                  data-testid="button-phone-option"
                >
                  <Phone className="w-5 h-5" />
                  Sign up with Mobile
                </Button>
              </>
            )}

            {authMethod === 'email' && (
              <div className="space-y-4 animate-fadeIn">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAuthMethod(null)}
                  className="text-theme-accent mb-2"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-theme-accent font-display">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="bg-theme-card/50 border-theme-accent/30 text-theme-text"
                    data-testid="input-email"
                  />
                </div>

                <p className="text-xs text-theme-text-muted">
                  We'll send a 6-digit verification code to this email.
                </p>

                <Button
                  onClick={handleSendCode}
                  disabled={sendCodeMutation.isPending}
                  className="w-full bg-theme-highlight text-theme-surface border-theme-highlight font-display font-bold glow-border-gold mt-4"
                  data-testid="button-send-code"
                >
                  {sendCodeMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Send Verification Code <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}

            {authMethod === 'phone' && (
              <div className="space-y-4 animate-fadeIn">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAuthMethod(null)}
                  className="text-theme-accent mb-2"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-theme-accent font-display">Mobile Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                    className="bg-theme-card/50 border-theme-accent/30 text-theme-text"
                    data-testid="input-phone"
                  />
                </div>

                <p className="text-xs text-theme-text-muted">
                  We'll send a 6-digit verification code via SMS.
                </p>

                <Button
                  onClick={handleSendCode}
                  disabled={sendCodeMutation.isPending}
                  className="w-full bg-theme-highlight text-theme-surface border-theme-highlight font-display font-bold glow-border-gold mt-4"
                  data-testid="button-send-code-phone"
                >
                  {sendCodeMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Send Verification Code <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-6 animate-fadeIn">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStep('auth');
                setVerificationCode('');
              }}
              className="text-theme-accent mb-2"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>

            <div className="text-center">
              <p className="text-theme-text mb-2">
                We sent a code to
              </p>
              <p className="text-theme-highlight font-medium">
                {authMethod === 'email' ? formData.email : formData.phone}
              </p>
            </div>

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={verificationCode}
                onChange={setVerificationCode}
                data-testid="input-verification-code"
              >
                <InputOTPGroup className="gap-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="w-10 h-12 text-lg bg-theme-card/50 border-theme-accent/30 text-theme-text rounded-md"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerifyCode}
              disabled={verifyCodeMutation.isPending || verificationCode.length !== 6}
              className="w-full bg-theme-highlight text-theme-surface border-theme-highlight font-display font-bold glow-border-gold"
              data-testid="button-verify-code"
            >
              {verifyCodeMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Verify Code <ChevronRight className="w-4 h-4 ml-1" />
            </Button>

            <Button
              variant="ghost"
              onClick={handleResendCode}
              disabled={sendCodeMutation.isPending}
              className="w-full text-theme-text-muted font-display"
              data-testid="button-resend-code"
            >
              {sendCodeMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Resend Code
            </Button>
          </div>
        )}

        {step === 'profile' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col items-center">
              <div 
                className="w-24 h-24 rounded-full border-2 border-theme-highlight bg-theme-card flex items-center justify-center cursor-pointer hover-elevate glow-border-gold"
                onClick={() => {
                  toast({
                    title: "Photo Upload",
                    description: "Photo upload will be available soon."
                  });
                }}
                data-testid="button-avatar-upload"
              >
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-theme-highlight" />
                )}
              </div>
              <p className="text-xs text-theme-text-muted mt-2">Tap to add photo</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-theme-accent font-display flex items-center gap-1">
                <User className="w-4 h-4" /> Your Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
                className="bg-theme-card/50 border-theme-accent/30 text-theme-text"
                data-testid="input-name"
              />
            </div>

            <Button
              onClick={handleProfileSubmit}
              disabled={updateUserMutation.isPending}
              className="w-full bg-theme-highlight text-theme-surface border-theme-highlight font-display font-bold glow-border-gold"
              data-testid="button-profile-submit"
            >
              {updateUserMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {step === 'location' && (
          <div className="space-y-6 animate-fadeIn text-center">
            <div className="w-20 h-20 rounded-full border-2 border-theme-accent bg-theme-card mx-auto flex items-center justify-center glow-border-teal">
              <MapPin className="w-10 h-10 text-theme-accent" />
            </div>

            <div>
              <h3 className="font-display text-xl text-theme-highlight mb-2">Enable Location</h3>
              <p className="text-theme-text-muted text-sm">
                Allow Grid Way to access your location to discover events happening near you.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <Button
                onClick={() => handleLocationPermission(true)}
                className="w-full bg-theme-highlight text-theme-surface border-theme-highlight font-display font-bold glow-border-gold"
                data-testid="button-location-allow"
              >
                Allow Location Access
              </Button>

              <Button
                variant="ghost"
                onClick={() => handleLocationPermission(false)}
                className="w-full text-theme-text-muted font-display"
                data-testid="button-location-skip"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-theme-text-muted mt-auto pt-4">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
