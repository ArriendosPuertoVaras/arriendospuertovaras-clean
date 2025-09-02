
import React, { useState, useEffect } from 'react';
import { ErrorLog } from '@/api/entities';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import BackButton from '@/components/ui/BackButton';

export default function AdminErrorsPage() {
  const [errorLogs, setErrorLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchErrors();
  }, []);

  const fetchErrors = async () => {
    setLoading(true);
    try {
      const logs = await ErrorLog.list('-created_date', 50); // Get latest 50 errors
      setErrorLogs(logs);
    } catch (error) {
      toast.error("Error al cargar los registros de errores.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (logId, newStatus) => {
    try {
      await ErrorLog.update(logId, { status: newStatus });
      toast.success(`Error marcado como ${newStatus}.`);
      fetchErrors(); // Refresh the list
    } catch (error) {
      toast.error("No se pudo actualizar el estado del error.");
    }
  };
  
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'new': return 'destructive';
      case 'seen': return 'secondary';
      case 'resolved': return 'default';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center gap-4 mb-6">
          <BackButton />
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Logs de Errores de Cliente</h1>
          </div>
        </div>
        <p>Cargando errores...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center gap-4 mb-6">
        <BackButton />
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Logs de Errores de Cliente</h1>
        </div>
        <Button onClick={fetchErrors}>Refrescar</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Últimos 50 Errores Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Mensaje</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errorLogs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>{format(new Date(log.created_date), 'dd/MM/yyyy HH:mm')}</TableCell>
                  <TableCell className="max-w-xs truncate" title={log.error_message}>{log.error_message}</TableCell>
                  <TableCell className="max-w-xs truncate" title={log.url}>{log.url}</TableCell>
                  <TableCell>{log.user_id || 'Anónimo'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(log.status)}>{log.status}</Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                     <Button size="sm" variant="outline" onClick={() => handleStatusChange(log.id, 'seen')} disabled={log.status === 'seen'}>Visto</Button>
                     <Button size="sm" onClick={() => handleStatusChange(log.id, 'resolved')} disabled={log.status === 'resolved'}>Resolver</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
