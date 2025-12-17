import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, User, MapPin, Camera, ChevronRight, ChevronLeft } from "lucide-react";
import { SiGoogle, SiApple } from "react-icons/si";

type SignUpStep = 'auth' | 'profile' | 'location';

interface SignUpScreenProps {
  onComplete: (userData: { name: string; avatar?: string }) => void;
}

export default function SignUpScreen({ onComplete }: SignUpScreenProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<SignUpStep>('auth');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    name: '',
    avatar: '',
  });

  const handleSocialLogin = (provider: string) => {
    toast({
      title: `${provider} Sign In`,
      description: `${provider} authentication will be connected soon.`
    });
    setStep('profile');
  };

  const handleEmailSubmit = () => {
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Fields",
        description: "Please enter both email and password.",
        variant: "destructive"
      });
      return;
    }
    setStep('profile');
  };

  const handlePhoneSubmit = () => {
    if (!formData.phone) {
      toast({
        title: "Missing Phone",
        description: "Please enter your mobile number.",
        variant: "destructive"
      });
      return;
    }
    setStep('profile');
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
    setStep('location');
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
            onComplete({ name: formData.name, avatar: formData.avatar });
          },
          () => {
            toast({
              title: "Location Denied",
              description: "You can enable this later in settings."
            });
            onComplete({ name: formData.name, avatar: formData.avatar });
          }
        );
      } else {
        toast({
          title: "Location Unavailable",
          description: "Location services are not supported on this device."
        });
        onComplete({ name: formData.name, avatar: formData.avatar });
      }
    } else {
      onComplete({ name: formData.name, avatar: formData.avatar });
    }
  };

  return (
    <div 
      className="h-screen w-full flex flex-col p-6"
      style={{
        background: 'var(--app-gradient)'
      }}
      data-testid="screen-signup"
    >
      <div className="text-center mb-8 pt-8">
        <h1 className="font-display text-3xl font-bold text-theme-highlight glow-text-gold">
          AURA
        </h1>
        <p className="text-theme-text-muted mt-2 text-sm">
          {step === 'auth' && 'Join the experience'}
          {step === 'profile' && 'Create your profile'}
          {step === 'location' && 'Find events nearby'}
        </p>
      </div>

      <div className="flex gap-2 justify-center mb-8">
        {['auth', 'profile', 'location'].map((s, i) => (
          <div
            key={s}
            className={`h-1 w-16 rounded-full transition-all ${
              s === step ? 'bg-theme-highlight glow-border-gold' : 
              ['auth', 'profile', 'location'].indexOf(step) > i ? 'bg-theme-accent' : 'bg-theme-card'
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

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-theme-accent font-display">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Create a password"
                    className="bg-theme-card/50 border-theme-accent/30 text-theme-text"
                    data-testid="input-password"
                  />
                </div>

                <Button
                  onClick={handleEmailSubmit}
                  className="w-full bg-theme-highlight text-theme-surface border-theme-highlight font-display font-bold glow-border-gold mt-4"
                  data-testid="button-email-submit"
                >
                  Continue <ChevronRight className="w-4 h-4 ml-1" />
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

                <Button
                  onClick={handlePhoneSubmit}
                  className="w-full bg-theme-highlight text-theme-surface border-theme-highlight font-display font-bold glow-border-gold mt-4"
                  data-testid="button-phone-submit"
                >
                  Continue <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
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
              className="w-full bg-theme-highlight text-theme-surface border-theme-highlight font-display font-bold glow-border-gold"
              data-testid="button-profile-submit"
            >
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
                Allow AURA to access your location to discover events happening near you.
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
