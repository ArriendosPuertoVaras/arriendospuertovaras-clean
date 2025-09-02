import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Plus,
  User as UserIcon,
  ChevronDown,
  LayoutDashboard,
  Home,
  Wrench } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";

export default function AuthSlot({
  user,
  status,
  handleLogin,
  handleLogout,
  userMenuItems,
  isAdmin,
  handleAdminDashboardClick,
  isAdminNavigating
}) {

  // 1. Loading State
  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse"></div>
        <div className="w-24 h-4 bg-slate-200 rounded animate-pulse"></div>
      </div>);

  }

  // 2. Authenticated State
  if (status === 'authenticated' && user) {
    return (
      <div className="flex items-center space-x-3">
        {/* Dropdown "Publicar" Button for hosts */}
        {user.user_type === 'arrendador' &&
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-primary text-primary-foreground mr-5 px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-10 btn-primary focus-outline" aria-label="Publicar nueva propiedad o servicio">
                <Plus className="w-4 h-4 mr-2" />
                Publicar
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={createPageUrl("AddProperty")} className="flex items-center space-x-2">
                  <Home className="w-4 h-4" />
                  <span>Publicar Propiedad</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={createPageUrl("AddService")} className="flex items-center space-x-2">
                  <Wrench className="w-4 h-4" />
                  <span>Ofrecer Servicio</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }

        {/* Admin Dashboard Button */}
        {isAdmin &&
        <Button
          onClick={handleAdminDashboardClick}
          disabled={isAdminNavigating}
          className="btn-primary text-sm focus-outline bg-red-600 hover:bg-red-700"
          aria-label="Abrir Dashboard Inteligente (Admin)">

            {isAdminNavigating ?
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" /> :

          <LayoutDashboard className="w-4 h-4 mr-2" />
          }
            Admin
          </Button>
        }

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 focus-outline h-10 px-3"
              aria-label={`Menu de ${user.full_name}`}>

              <Avatar className="w-8 h-8">
                <AvatarImage src={user.profile_image} alt={user.full_name} />
                <AvatarFallback>
                  {user.full_name ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user.full_name?.split(' ')[0] || 'Usuario'}</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {userMenuItems.
            filter((item) => item.role.includes(user.user_type)).
            map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem key={item.name} asChild>
                    <Link to={item.url} className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  </DropdownMenuItem>);

            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>);

  }

  // 3. Unauthenticated State
  return (
    <Button
      onClick={handleLogin}
      className="btn-primary text-sm px-4 focus-outline h-10"
      style={{ minWidth: '150px' }} // Equivalent to w-48 to prevent layout shift
      aria-label="Iniciar sesión">
      Iniciar Sesión
    </Button>);

}