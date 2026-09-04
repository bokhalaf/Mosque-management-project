import React from 'react';
import {
  GraduationCap, Shield, Users, Mail, Phone, Clock,
  CheckCircle2, AlertCircle, Lock, Eye, Loader2
} from 'lucide-react';
import { QuranPerson } from '../../../../domain/entities/QuranPeople';

interface StaffTableRowProps {
  person: QuranPerson;
  isUpdatingStatus?: boolean;
  onViewDetails?: (person: QuranPerson) => void;
  onChangeStatus: (id: string | number, newStatus: 'active' | 'inactive') => void;
}

export function StaffTableRow({
  person,
  isUpdatingStatus,
  onViewDetails,
  onChangeStatus,
}: StaffTableRowProps) {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'teacher':
        return { label: 'معلم قرآن', color: 'bg-muted text-muted-foreground border-border', icon: GraduationCap };
      case 'halaqa_supervisor':
        return { label: 'مشرف حلقة', color: 'bg-muted text-muted-foreground border-border', icon: Shield };
      case 'student':
      default:
        return { label: 'طالب بالحلقة', color: 'bg-muted text-muted-foreground border-border', icon: Users };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'نشط', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 };
      case 'pending_invitation':
        return { label: 'دعوة معلقة', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Clock };
      case 'inactive':
      default:
        return { label: 'غير نشط', color: 'bg-muted text-muted-foreground border-border', icon: AlertCircle };
    }
  };

  const roleInfo = getRoleBadge(person.role);
  const statusInfo = getStatusBadge(person.status);
  const RoleIcon = roleInfo.icon;
  const StatusIcon = statusInfo.icon;

  const isActive = person.status === 'active';

  return (
    <tr className="border-b border-border/50 hover:bg-muted/20 transition-all font-['Cairo']">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
            {person.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-xs text-foreground">{person.name}</div>
            <div className="text-[11px] text-muted-foreground">{person.circle_name || 'حلقة عامة'}</div>
          </div>
        </div>
      </td>

      <td className="p-4">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${roleInfo.color}`}>
          <RoleIcon className="w-3.5 h-3.5" />
          <span>{roleInfo.label}</span>
        </span>
      </td>

      <td className="p-4">
        <div className="space-y-1 text-xs text-muted-foreground">
          {person.phone && (
            <div className="flex items-center gap-1.5 font-mono">
              <Phone className="w-3 h-3 text-primary" />
              <span>{person.phone}</span>
            </div>
          )}
          {person.email && (
            <div className="flex items-center gap-1.5 font-mono">
              <Mail className="w-3 h-3 text-primary" />
              <span>{person.email}</span>
            </div>
          )}
        </div>
      </td>

      <td className="p-4">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${statusInfo.color}`}>
          <StatusIcon className="w-3 h-3" />
          <span>{statusInfo.label}</span>
        </span>
      </td>

      <td className="p-4 text-left">
        <div className="flex items-center justify-end gap-1">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(person)}
              className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-all"
              title="عرض التفاصيل"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          {isUpdatingStatus ? (
            <div className="p-2 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          ) : isActive ? (
            <button
              onClick={() => onChangeStatus(person.id, 'inactive')}
              className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-xl transition-all active:scale-95"
              title="تجميد الحساب (PATCH /api/users/{user}/status)"
            >
              <Lock className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onChangeStatus(person.id, 'active')}
              className="p-2 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl transition-all active:scale-95"
              title="تفعيل الحساب (PATCH /api/users/{user}/status)"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
