import { useEffect, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { Eye, EyeOff, Mail, ShieldCheck } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { roleHome } from "@/lib/account-access";

type Phase = "signin" | "signup" | "verify" | "forgot" | "reset" | "success";
type AuthReply = { message?: string; error?: string; };

async function callAuth(path: string, body: Record<string,unknown>) {
  const response = await fetch("/api/neon-auth/" + path, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let data: AuthReply | null = null;
  try { data = (await response.json()) as AuthReply; } catch { /* server rejected malformed reply */ }
  return { ok: response.ok, status: response.status, data };
}
function extractError(data: AuthReply | null, fallback: string) {
  return typeof data?.message === "string" && data.message.length < 200
    ? data.message : fallback;
}

export function NeonAuthPanel() {
  const query = useSearch({ from: "/auth" });
  const [phase, setPhase] = useState<Phase>(query.mode === "signin" ? "signin" : "signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [otp, setOtp] = useState("");
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [resendAt, setResendAt] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setPhase(query.mode === "signin" ? "signin" : "signup");
  }, [query.mode]);
  useEffect(() => {
    if (!resendAt) return;
    const timer = window.setInterval(() => setSeconds(Math.max(0,Math.ceil((resendAt-Date.now())/1000))),1000);
    return () => window.clearInterval(timer);
  }, [resendAt]);

  function change(next: Phase) {
    setPhase(next);setMessage("");setOtp("");setPassword("");setConfirm("");
    const nextUrl = next === "signin" ? "/auth?mode=signin" : "/auth?mode=signup";
    window.history.replaceState({}, "", nextUrl);
  }
  async function submit() {
    if (busy) return;
    const normalized = email.trim().toLowerCase();
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setMessage("Enter a valid email address.");return;
    }
    setBusy(true);setMessage("");
    try {
      if (phase === "signin") {
        if (!password) throw Error("Enter your password.");
        const login = () => callAuth("sign-in/email",{email:normalized,password});
        let result = await login();
        if (!result.ok && result.status === 401) {
          const upgrade = await fetch("/api/neon-legacy-login",{
            method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},
            body:JSON.stringify({email:normalized,password}),
          });
          if(upgrade.ok && (await upgrade.json()).ok===true)result=await login();
        }
        if(!result.ok) throw Error("Invalid email or password.");
        const accountResponse=await fetch("/api/neon-account",{credentials:"same-origin",cache:"no-store"});
        if(!accountResponse.ok) throw Error("Your account could not be verified.");
        const account=await accountResponse.json();
        window.location.assign(roleHome(account.role));
        return;
      }
      if (phase === "signup") {
        if(name.trim().length<2 || name.trim().length>100)throw Error("Enter your full name.");
        if(password.length<8)throw Error("Choose a password with at least 8 characters.");
        if(password!==confirm)throw Error("Passwords do not match.");
        if(!agree)throw Error("Agree to the community rules before creating your account.");
        const signed=await callAuth("sign-up/email",{email:normalized,name:name.trim(),password});
        if(!signed.ok)throw Error(extractError(signed.data,"Account could not be created. Check your email or try signing in."));
        setPassword("");setConfirm("");setPhase("verify");
        setMessage("Enter the six-digit verification code sent to your email.");
        setResendAt(Date.now()+60000);
        return;
      }
      if (phase === "verify") {
        if(!/^\d{6}$/.test(otp))throw Error("Enter the six-digit verification code.");
        const verified=await callAuth("email-otp/verify-email",{email:normalized,otp});
        if(!verified.ok)throw Error("The verification code is invalid or expired.");
        const session=await fetch("/api/neon-auth/get-session",{credentials:"same-origin",cache:"no-store"});
        const user=session.ok?await session.json():null;
        if(user?.user?.id && user?.user?.emailVerified)window.location.assign("/messages");
        else {setPhase("signin");setMessage("Email verified. Sign in with your password.");}
        return;
      }
      if (phase === "forgot") {
        const response=await callAuth("email-otp/request-password-reset",{email:normalized});
        if(!response.ok)throw Error("A reset code could not be requested.");
        setPhase("reset");setResendAt(Date.now()+60000);
        setMessage("If your account exists, a password reset code has been emailed.");
        return;
      }
      if (phase === "reset") {
        if(!/^\d{6}$/.test(otp))throw Error("Enter the six-digit reset code.");
        if(password.length<8||password!==confirm)throw Error("Choose matching passwords of at least eight characters.");
        const result=await callAuth("email-otp/reset-password",{email:normalized,otp,password});
        if(!result.ok)throw Error("The reset code is invalid or expired.");
        setPassword("");setConfirm("");setOtp("");setPhase("signin");
        setMessage("Password updated. Sign in with your new password.");
      }
    } catch(error) {
      setMessage(error instanceof Error?error.message:"Please try again.");
    }finally{setBusy(false)}
  }
  async function resend() {
    if(seconds>0 || busy)return;
    setBusy(true);setMessage("");
    const path=phase==="verify"?"email-otp/send-verification-otp":"email-otp/request-password-reset";
    const body=phase==="verify"?{email:email.trim().toLowerCase(),type:"email-verification"}:{email:email.trim().toLowerCase()};
    try{
      const result=await callAuth(path,body);
      if(!result.ok)throw Error("The code could not be resent.");
      setResendAt(Date.now()+60000);setMessage("A new code has been sent.");
    }catch(error){setMessage(error instanceof Error?error.message:"Please try again.");}
    finally{setBusy(false)}
  }
  const heading:Record<Phase,string>={
    signin:"Sign in to continue",signup:"Join BraverTogether",verify:"Verify your email",
    forgot:"Reset your password",reset:"Choose a new password",success:"You're all set",
  };
  const label:Record<Phase,string>={
    signin:"Sign in",signup:"Create account",verify:"Verify code",
    forgot:"Send reset code",reset:"Reset password",success:"Continue",
  };

  return (
    <SiteLayout>
      <main className="mx-auto max-w-6xl px-5 py-12 md:py-20">
        <div className="mx-auto max-w-lg rounded-3xl border border-border bg-card px-6 py-9 shadow-lg md:px-10">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <ShieldCheck className="h-6 w-6"/>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{heading[phase]}</h1>
          <p className="mt-2 mb-7 text-sm leading-relaxed text-muted-foreground">
            {phase==="signup"?"Create a secure member account to access advisors, messages and competitions.":
            phase==="signin"?"Welcome back. Your existing password continues to work.":
            phase==="verify"?"Enter the code from your verification email.":
            "We will send a six-digit code to the email on your account."}
          </p>
          <form onSubmit={(event)=>{event.preventDefault();void submit()}} className="space-y-4">
            {phase==="signup" && <label className="block text-sm font-medium">Full name
              <input className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3" autoComplete="name" required maxLength={100} value={name} onChange={e=>setName(e.target.value)}/>
            </label>}
            <label className="block text-sm font-medium">Email address
              <span className="relative mt-1 block">
                <Mail className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-muted-foreground"/>
                <input className="w-full rounded-xl border border-border bg-background py-3 pr-4 pl-10" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} readOnly={phase==="verify"}/>
              </span>
            </label>
            {(phase==="signin"||phase==="signup"||phase==="reset") && <label className="block text-sm font-medium">
              {phase==="reset"?"New password":"Password"}
              <span className="relative mt-1 block">
                <input className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-11" type={showPassword?"text":"password"} autoComplete={phase==="signin"?"current-password":"new-password"} required minLength={phase==="signin"?1:8} value={password} onChange={e=>setPassword(e.target.value)}/>
                <button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?"Hide password":"Show password"} className="absolute right-3 top-3.5 text-muted-foreground">
                  {showPassword?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}
                </button>
              </span>
            </label>}
            {(phase==="signup"||phase==="reset") && <label className="block text-sm font-medium">Confirm password
              <input className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3" type="password" autoComplete="new-password" required minLength={8} value={confirm} onChange={e=>setConfirm(e.target.value)}/>
            </label>}
            {(phase==="verify"||phase==="reset") && <label className="block text-sm font-medium">Six-digit code
              <input inputMode="numeric" pattern="[0-9]{6}" autoComplete="one-time-code" className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 tracking-widest" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,""))}/>
            </label>}
            {phase==="signup" && <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <input className="mt-1" type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)}/>
              <span>I agree to the <a className="underline" href="/community-guidelines" target="_blank" rel="noopener noreferrer">community guidelines</a> and privacy policy.</span>
            </label>}
            {message && <p role="status" className="text-sm text-foreground">{message}</p>}
            <button className="w-full rounded-xl bg-blue-700 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50" type="submit" disabled={busy}>
              {busy?"Working…":label[phase]}
            </button>
          </form>
          {(phase==="verify"||phase==="reset") && <button type="button" disabled={busy||seconds>0} onClick={()=>void resend()} className="mt-4 text-sm text-blue-700 underline disabled:opacity-50">
            {seconds>0?"Resend code in "+seconds+"s":"Resend verification code"}
          </button>}
          <div className="mt-6 border-t border-border pt-5 text-sm">
            {phase==="signin"?<>
              <button type="button" onClick={()=>change("forgot")} className="block text-blue-700 underline">Forgot password?</button>
              <p className="mt-3 text-muted-foreground">New here? <button type="button" className="font-semibold text-blue-700" onClick={()=>change("signup")}>Create an account</button></p>
            </>:<p className="text-muted-foreground">Already registered? <button type="button" className="font-semibold text-blue-700" onClick={()=>change("signin")}>Sign in</button></p>}
          </div>
        </div>
      </main>
    </SiteLayout>
  );
}
