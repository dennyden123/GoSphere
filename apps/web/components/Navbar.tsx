import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Leaf, Search, Bell } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 glass-panel">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4">
        <div className="flex items-center gap-2 mr-4 md:flex">
          <Leaf className="h-6 w-6 text-primary text-glow" />
          <span className="font-bold tracking-widest text-lg uppercase text-white">GroSphere</span>
        </div>
        
        <div className="flex flex-1 items-center space-x-4 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search your ecosystem..."
                className="h-9 w-full rounded-md border border-white/10 bg-black/40 pl-9 md:w-[300px] text-white placeholder:text-slate-500 focus-visible:ring-primary"
              />
            </div>
          </div>
          <Button variant="ghost" size="icon" className="relative hover:bg-white/10 hover:text-primary transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary box-glow"></span>
          </Button>
          <Avatar className="h-8 w-8 border border-primary/30">
            <AvatarImage src="/placeholder-user.jpg" alt="@user" />
            <AvatarFallback className="bg-primary/20 text-primary">U</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
