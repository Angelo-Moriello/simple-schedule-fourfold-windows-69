
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Statistics from '@/components/Statistics';
import SimpleHeader from '@/components/SimpleHeader';
import AppointmentFilters from '@/components/appointment-history/AppointmentFilters';
import ClientSearchBar from '@/components/appointment-history/ClientSearchBar';
import AppointmentHistoryCard from '@/components/appointment-history/AppointmentHistoryCard';
import { useAppointmentHistoryData } from '@/hooks/useAppointmentHistoryData';

const AppointmentHistory = () => {
  const navigate = useNavigate();
  const [showStatistics, setShowStatistics] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  const {
    appointments,
    employees,
    isLoading,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    uniqueClients,
    filteredAppointments,
    getEmployeeName,
    getEmployeeSpecialization,
    refreshData,
  } = useAppointmentHistoryData();

  const handleAppointmentDeleted = () => {
    refreshData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento storico da Supabase...</p>
        </div>
      </div>
    );
  }

  if (showStatistics) {
    return <Statistics appointments={appointments} employees={employees} onBack={() => setShowStatistics(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <SimpleHeader 
          title="Storico Appuntamenti"
          subtitle={`${filteredAppointments.length} appuntamenti trovati`}
        >
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="h-10 w-10 rounded-full shrink-0"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <Button
            onClick={() => setShowStatistics(true)}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 h-10 sm:h-12 px-4 sm:px-6"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistiche
          </Button>
        </SimpleHeader>

        <div className="space-y-4 mb-6">
          <AppointmentFilters
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            customStartDate={customStartDate}
            setCustomStartDate={setCustomStartDate}
            customEndDate={customEndDate}
            setCustomEndDate={setCustomEndDate}
          />

          <ClientSearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            uniqueClients={uniqueClients}
            showSuggestions={showSearchSuggestions}
            setShowSuggestions={setShowSearchSuggestions}
          />
        </div>

        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <Card className="p-6 sm:p-8 text-center">
              <p className="text-gray-500 text-sm sm:text-base">
                {searchTerm ? 'Nessun appuntamento trovato per la ricerca' : 'Nessun appuntamento salvato'}
              </p>
            </Card>
          ) : (
            filteredAppointments.map((appointment) => (
              <AppointmentHistoryCard
                key={appointment.id}
                appointment={appointment}
                getEmployeeName={getEmployeeName}
                getEmployeeSpecialization={getEmployeeSpecialization}
                onAppointmentDeleted={handleAppointmentDeleted}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentHistory;
