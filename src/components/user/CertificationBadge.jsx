import React, { useState, useEffect } from "react";
import { Certification } from "@/api/entities";
import { ShieldCheck, Award, FileText, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function CertificationBadge({ userId, serviceCategory, compact = false }) {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertifications();
  }, [userId, serviceCategory]);

  const loadCertifications = async () => {
    try {
      const filters = { user_id: userId, active: true };
      if (serviceCategory) {
        filters.category = serviceCategory;
      }
      
      const userCertifications = await Certification.filter(filters);
      setCertifications(userCertifications);
    } catch (error) {
      console.error("Error loading certifications:", error);
    }
    setLoading(false);
  };

  const verifiedCertifications = certifications.filter(cert => cert.verification_status === "verified");
  const pendingCertifications = certifications.filter(cert => cert.verification_status === "pending");

  if (loading) return null;

  const CertificationModal = ({ certification }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto p-2">
          <Eye className="w-4 h-4 mr-1" />
          Ver certificado
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{certification.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Entidad emisora:</strong> {certification.issuing_authority}
            </div>
            <div>
              <strong>Número de licencia:</strong> {certification.license_number}
            </div>
            <div>
              <strong>Fecha de emisión:</strong> {new Date(certification.issue_date).toLocaleDateString()}
            </div>
            {certification.expiry_date && (
              <div>
                <strong>Fecha de expiración:</strong> {new Date(certification.expiry_date).toLocaleDateString()}
              </div>
            )}
          </div>
          
          {certification.document_url && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Documento adjunto</span>
                <a 
                  href={certification.document_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FileText className="w-5 h-5" />
                </a>
              </div>
              {certification.document_url.includes('.pdf') ? (
                <embed 
                  src={certification.document_url} 
                  width="100%" 
                  height="400px" 
                  type="application/pdf"
                />
              ) : (
                <img 
                  src={certification.document_url} 
                  alt="Certificación" 
                  className="w-full max-h-96 object-contain"
                />
              )}
            </div>
          )}

          {certification.verification_status === "verified" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-green-700">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-medium">Certificación verificada</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Este documento ha sido verificado por nuestro equipo el {new Date(certification.verification_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {verifiedCertifications.length > 0 && (
          <Badge className="bg-green-100 text-green-800 flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Certificado</span>
          </Badge>
        )}
        {pendingCertifications.length > 0 && verifiedCertifications.length === 0 && (
          <Badge variant="outline" className="text-yellow-700 border-yellow-300">
            Certificaciones pendientes
          </Badge>
        )}
        {certifications.length === 0 && (
          <span className="text-sm text-gray-500">Sin certificaciones</span>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h4 className="font-semibold mb-3 flex items-center space-x-2">
          <Award className="w-5 h-5" />
          <span>Certificaciones</span>
        </h4>

        {verifiedCertifications.length > 0 ? (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-green-700 mb-2">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-medium">Este oferente ha presentado certificaciones verificadas</span>
              </div>
              <p className="text-sm text-green-600">
                Las certificaciones han sido validadas por nuestro equipo para garantizar su autenticidad.
              </p>
            </div>

            <div className="space-y-2">
              {verifiedCertifications.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{cert.title}</div>
                    <div className="text-sm text-gray-600">{cert.issuing_authority}</div>
                  </div>
                  <CertificationModal certification={cert} />
                </div>
              ))}
            </div>
          </div>
        ) : pendingCertifications.length > 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-yellow-700 mb-2">
              <FileText className="w-5 h-5" />
              <span className="font-medium">Certificaciones en proceso de verificación</span>
            </div>
            <p className="text-sm text-yellow-600">
              Este oferente ha presentado certificaciones que están siendo verificadas por nuestro equipo.
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              Este oferente no ha proporcionado certificaciones. Aunque no son obligatorias, 
              las certificaciones verificadas proporcionan mayor confianza.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}