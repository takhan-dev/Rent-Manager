import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Home } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "@shared/routes";

export default function AuthPage() {
  const { login, register, isLoggingIn, isRegistering, user } = useAuth();
  const [, setLocation] = useLocation();

  if (user) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-primary/20 rotate-3 hover:rotate-6 transition-transform">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight">PropMan</h1>
          <p className="text-muted-foreground">Property management simplified.</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm onSubmit={login} isLoading={isLoggingIn} />
          </TabsContent>
          
          <TabsContent value="register">
            <RegisterForm onSubmit={register} isLoading={isRegistering} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function LoginForm({ onSubmit, isLoading }: { onSubmit: any, isLoading: boolean }) {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof api.auth.login.input>>({
    resolver: zodResolver(api.auth.login.input)
  });

  return (
    <Card className="border-border/50 shadow-xl">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...register("username")} />
            {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function RegisterForm({ onSubmit, isLoading }: { onSubmit: any, isLoading: boolean }) {
  const [role, setRole] = useState<"tenant" | "landlord">("tenant");
  const schema = api.auth.register.input;
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { role: "tenant" }
  });

  const handleRoleChange = (newRole: "tenant" | "landlord") => {
    setRole(newRole);
    setValue("role", newRole);
  };

  return (
    <Card className="border-border/50 shadow-xl">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Get started managing your properties</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div 
              onClick={() => handleRoleChange("tenant")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${
                role === "tenant" 
                  ? "border-primary bg-primary/5 text-primary" 
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="font-semibold text-sm">Tenant</span>
            </div>
            <div 
              onClick={() => handleRoleChange("landlord")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${
                role === "landlord" 
                  ? "border-primary bg-primary/5 text-primary" 
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Building2 className="w-6 h-6" />
              <span className="font-semibold text-sm">Landlord</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-name">Full Name</Label>
            <Input id="reg-name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-username">Username</Label>
            <Input id="reg-username" {...register("username")} />
            {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
            <Input id="reg-password" type="password" {...register("password")} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Register"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
