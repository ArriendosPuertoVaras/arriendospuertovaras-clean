import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Search, Bell, Menu, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AdminHeader = () => {
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    const fetchUser = async () => {
        try {
            const user = await User.me();
            setCurrentUser(user);
        } catch (e) {
            console.error("Failed to fetch user in AdminHeader", e);
        }
    };
    fetchUser();
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white px-6 shadow-sm">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
        <Input
          type="search"
          placeholder="Buscar publicaciones, usuarios, tickets..."
          className="w-full pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-slate-100"
        />
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">3</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Notificación 1</DropdownMenuItem>
            <DropdownMenuItem>Notificación 2</DropdownMenuItem>
            <DropdownMenuItem>Notificación 3</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
             <Avatar className="h-9 w-9 cursor-pointer">
              <AvatarImage src={currentUser?.profile_image} alt={currentUser?.full_name} />
              <AvatarFallback>{currentUser?.full_name?.charAt(0) || 'A'}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
           <DropdownMenuContent align="end">
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Cerrar Sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AdminHeader;