import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle, XCircle, PauseCircle, PlayCircle, Archive } from "lucide-react";
import { Input } from "@/components/ui/input";

const StatusBadge = ({ status }) => {
    const statusConfig = {
        // Properties
        activa: 'bg-green-100 text-green-800',
        pausada: 'bg-yellow-100 text-yellow-800',
        pendiente_aprobacion: 'bg-blue-100 text-blue-800',
        rechazada: 'bg-red-100 text-red-800',
        // Services
        activo: 'bg-green-100 text-green-800',
        // Blog
        published: 'bg-green-100 text-green-800',
        draft: 'bg-slate-100 text-slate-800',
        scheduled: 'bg-purple-100 text-purple-800',
        archived: 'bg-orange-100 text-orange-800',
    };
    return <Badge className={statusConfig[status] || 'bg-gray-100 text-gray-800'}>{status?.replace(/_/g, ' ')}</Badge>;
};

export default function PublicationTable({ data, columns, loading, users, entityType, onStatusChange, statusOptions }) {
    const [filter, setFilter] = useState('');

    const getLinkForEntity = (item) => {
        switch (entityType) {
            case 'properties':
                return createPageUrl("PropertyDetail") + `?id=${item.id}`;
            case 'services':
                return createPageUrl("ServiceDetail") + `?id=${item.id}`;
            case 'blog':
                 return createPageUrl("BlogPost") + `?slug=${item.slug}`;
            default:
                return '#';
        }
    };
    
    const filteredData = data.filter(item => {
        const title = item.title || '';
        const userName = users.get(item.owner_id || item.provider_id || item.author_id) || '';
        return title.toLowerCase().includes(filter.toLowerCase()) || userName.toLowerCase().includes(filter.toLowerCase());
    });

    if (loading) {
        return <div className="text-center p-8">Cargando publicaciones...</div>;
    }

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm mt-4">
            <div className="p-4">
                 <Input
                    placeholder="Filtrar por título o usuario..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="max-w-sm"
                />
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map(col => <TableHead key={col.accessor}>{col.header}</TableHead>)}
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.length > 0 ? (
                        filteredData.map(item => (
                            <TableRow key={item.id}>
                                {columns.map(col => {
                                    const cellValue = item[col.accessor];
                                    if (col.accessor.includes('_id')) {
                                        return <TableCell key={col.accessor}>{users.get(cellValue) || cellValue}</TableCell>;
                                    }
                                    if (col.accessor === 'status') {
                                        return <TableCell key={col.accessor}><StatusBadge status={cellValue} /></TableCell>;
                                    }
                                    if (col.accessor.includes('_date')) {
                                        return <TableCell key={col.accessor}>{new Date(cellValue).toLocaleDateString('es-CL')}</TableCell>;
                                    }
                                    return <TableCell key={col.accessor} className="truncate max-w-[200px]">{cellValue}</TableCell>;
                                })}
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menú</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                             <DropdownMenuItem asChild>
                                                <Link to={getLinkForEntity(item)} target="_blank">Ver Publicación</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {Object.entries(statusOptions).map(([statusKey, {label}]) => (
                                                <DropdownMenuItem key={statusKey} onClick={() => onStatusChange(entityType, item.id, statusKey)}>
                                                    {label}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                                No se encontraron resultados.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}