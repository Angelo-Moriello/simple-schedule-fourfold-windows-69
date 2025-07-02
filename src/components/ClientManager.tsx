
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users } from 'lucide-react';
import { useClientManager } from '@/hooks/useClientManager';
import ClientSearchBar from './client-manager/ClientSearchBar';
import ClientList from './client-manager/ClientList';
import ClientForm from './ClientForm';
import ClientDetailDialog from './ClientDetailDialog';

interface ClientManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ClientManager: React.FC<ClientManagerProps> = ({ isOpen, onClose }) => {
  const {
    filteredClients,
    searchTerm,
    setSearchTerm,
    selectedClient,
    isClientFormOpen,
    setIsClientFormOpen,
    isClientDetailOpen,
    setIsClientDetailOpen,
    isLoading,
    handleClientClick,
    handleClientAdded,
    handleClientUpdated,
    handleClientDeleted
  } = useClientManager(isOpen);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] w-full sm:max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0 border-b pb-4">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <div className="bg-blue-100 rounded-full p-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              Gestione Clienti
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col space-y-4 overflow-hidden min-h-0">
            <div className="flex-shrink-0 px-1">
              <ClientSearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddClient={() => setIsClientFormOpen(true)}
              />
            </div>

            <div className="flex-1 overflow-hidden px-1">
              <ClientList
                filteredClients={filteredClients}
                isLoading={isLoading}
                searchTerm={searchTerm}
                onClientClick={handleClientClick}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ClientForm
        isOpen={isClientFormOpen}
        onClose={() => setIsClientFormOpen(false)}
        onClientAdded={handleClientAdded}
      />

      {selectedClient && (
        <ClientDetailDialog
          isOpen={isClientDetailOpen}
          onClose={() => setIsClientDetailOpen(false)}
          client={selectedClient}
          onClientUpdated={handleClientUpdated}
          onClientDeleted={handleClientDeleted}
        />
      )}
    </>
  );
};

export default ClientManager;
