import { useState } from 'react';
import Navbar from '@/components/Navbar';
import AdminGeneros from '@/components/admin/AdminGeneros';
import AdminDirectores from '@/components/admin/AdminDirectores';
import AdminProductoras from '@/components/admin/AdminProductoras';
import AdminTipos from '@/components/admin/AdminTipos';
import AdminMedia from '@/components/admin/AdminMedia';
import { Film, Clapperboard, Building2, Tag, Video } from 'lucide-react';

const tabs = [
  { id: 'generos', label: 'Géneros', icon: Tag },
  { id: 'directores', label: 'Directores', icon: Clapperboard },
  { id: 'productoras', label: 'Productoras', icon: Building2 },
  { id: 'tipos', label: 'Tipos', icon: Film },
  { id: 'media', label: 'Media', icon: Video },
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState('generos');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="mb-2 font-display text-4xl text-foreground">
          Panel <span className="text-gradient-cinema">Administrador</span>
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">Gestión de contenido de Uni Movies X</p>

        {/* Tabs */}
        <div className="mb-8 flex flex-wrap gap-1 rounded-lg bg-secondary p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-secondary-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === 'generos' && <AdminGeneros />}
        {activeTab === 'directores' && <AdminDirectores />}
        {activeTab === 'productoras' && <AdminProductoras />}
        {activeTab === 'tipos' && <AdminTipos />}
        {activeTab === 'media' && <AdminMedia />}
      </div>
    </div>
  );
};

export default Admin;
