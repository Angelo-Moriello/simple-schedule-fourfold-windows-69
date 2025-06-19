import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ArrowLeft, TrendingUp, Users, Calendar, Filter, Printer } from 'lucide-react';
import { Appointment, Employee } from '@/types/appointment';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { it } from 'date-fns/locale';
import SimpleHeader from './SimpleHeader';

interface StatisticsProps {
  appointments: Appointment[];
  employees: Employee[];
  onBack: () => void;
}

type TimeFilter = 'day' | 'week' | 'month' | 'year';
type SpecializationFilter = 'all' | 'Parrucchiere' | 'Estetista';

interface PrintOptions {
  summary: boolean;
  services: boolean;
  employees: boolean;
  clientDetails: boolean;
  serviceDistribution: boolean;
}

const Statistics = ({ appointments, employees, onBack }: StatisticsProps) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [specializationFilter, setSpecializationFilter] = useState<SpecializationFilter>('all');
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    summary: true,
    services: true,
    employees: true,
    clientDetails: false,
    serviceDistribution: true
  });
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

  const serviceTypes = ['Piega', 'Colore', 'Taglio', 'Colpi di sole', 'Trattamento Capelli', 'Pulizia Viso', 'Manicure', 'Pedicure', 'Massaggio', 'Depilazione', 'Trattamento Corpo'];
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#87ceeb', '#dda0dd', '#98fb98', '#f0e68c', '#ffa07a'];

  // Filter employees based on specialization
  const filteredEmployees = useMemo(() => {
    if (specializationFilter === 'all') return employees;
    return employees.filter(emp => emp.specialization === specializationFilter);
  }, [employees, specializationFilter]);

  // Get employee IDs for filtering appointments
  const filteredEmployeeIds = useMemo(() => {
    return filteredEmployees.map(emp => emp.id);
  }, [filteredEmployees]);

  // Filter appointments by time period and specialization
  const filteredAppointments = useMemo(() => {
    let startDate: Date;
    let endDate: Date;

    switch (timeFilter) {
      case 'day':
        startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
        endDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(selectedDate);
        endDate = endOfMonth(selectedDate);
        break;
      case 'year':
        startDate = startOfYear(selectedDate);
        endDate = endOfYear(selectedDate);
        break;
      default:
        return appointments;
    }

    return appointments
      .filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        const isInTimeRange = isWithinInterval(appointmentDate, { start: startDate, end: endDate });
        const isInSpecialization = filteredEmployeeIds.includes(appointment.employeeId);
        return isInTimeRange && isInSpecialization;
      });
  }, [appointments, timeFilter, selectedDate, filteredEmployeeIds]);

  // Statistiche per tipo di servizio
  const serviceStats = useMemo(() => {
    const stats = serviceTypes.map(serviceType => {
      const count = filteredAppointments.filter(app => app.serviceType === serviceType).length;
      const percentage = filteredAppointments.length > 0 ? (count / filteredAppointments.length * 100).toFixed(1) : '0';
      return {
        name: serviceType,
        value: count,
        percentage: parseFloat(percentage)
      };
    }).filter(stat => stat.value > 0);

    return stats;
  }, [filteredAppointments]);

  // Enhanced employee statistics with client information
  const employeeStats = useMemo(() => {
    return filteredEmployees.map(employee => {
      const employeeAppointments = filteredAppointments.filter(app => app.employeeId === employee.id);
      const serviceBreakdown = serviceTypes.map(serviceType => ({
        serviceType,
        count: employeeAppointments.filter(app => app.serviceType === serviceType).length
      })).filter(item => item.count > 0);

      // Get client details for this employee
      const clientDetails = employeeAppointments.map(app => ({
        client: app.client,
        date: app.date,
        time: app.time,
        serviceType: app.serviceType,
        duration: app.duration
      })).sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());

      const uniqueClients = new Set(employeeAppointments.map(app => app.client)).size;

      return {
        id: employee.id,
        name: employee.name,
        specialization: employee.specialization,
        totalAppointments: employeeAppointments.length,
        uniqueClients,
        serviceBreakdown,
        clientDetails
      };
    }).filter(emp => emp.totalAppointments > 0);
  }, [filteredAppointments, filteredEmployees]);

  const formatPeriodLabel = () => {
    switch (timeFilter) {
      case 'day':
        return format(selectedDate, 'dd MMMM yyyy', { locale: it });
      case 'week':
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'dd MMM', { locale: it })} - ${format(weekEnd, 'dd MMM yyyy', { locale: it })}`;
      case 'month':
        return format(selectedDate, 'MMMM yyyy', { locale: it });
      case 'year':
        return format(selectedDate, 'yyyy', { locale: it });
      default:
        return '';
    }
  };

  // Enhanced print function with selectable options
  const handlePrint = () => {
    let printContent = `
      <html>
        <head>
          <title>Statistiche Appuntamenti - ${formatPeriodLabel()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            h2 { color: #666; margin-top: 30px; }
            h3 { color: #777; margin-top: 20px; }
            .summary { display: flex; gap: 20px; margin: 20px 0; flex-wrap: wrap; }
            .summary-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; flex: 1; min-width: 200px; }
            .service-list { list-style: none; padding: 0; }
            .service-item { display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #eee; }
            .employee-section { margin: 20px 0; border: 1px solid #ddd; padding: 15px; border-radius: 8px; page-break-inside: avoid; }
            .client-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px; }
            .client-item { background: #f9f9f9; padding: 8px; border-radius: 4px; font-size: 0.85em; }
            .service-breakdown { display: flex; gap: 15px; flex-wrap: wrap; margin: 10px 0; }
            .service-chip { background: #e3f2fd; padding: 5px 10px; border-radius: 4px; font-size: 0.85em; }
            .chart-placeholder { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 15px 0; }
            @media print { 
              body { margin: 0; } 
              .employee-section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h1>Statistiche Appuntamenti - ${formatPeriodLabel()}</h1>
          <p><strong>Filtro:</strong> ${specializationFilter === 'all' ? 'Tutte le specializzazioni' : specializationFilter}</p>
    `;

    if (printOptions.summary) {
      printContent += `
        <h2>Riepilogo Generale</h2>
        <div class="summary">
          <div class="summary-card">
            <h3>Totale Appuntamenti</h3>
            <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">${filteredAppointments.length}</p>
          </div>
          <div class="summary-card">
            <h3>Clienti Unici</h3>
            <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">${new Set(filteredAppointments.map(app => app.client)).size}</p>
          </div>
          <div class="summary-card">
            <h3>Dipendenti Attivi</h3>
            <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">${employeeStats.length}</p>
          </div>
          <div class="summary-card">
            <h3>Servizi Diversi</h3>
            <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">${serviceStats.length}</p>
          </div>
        </div>
      `;
    }

    if (printOptions.serviceDistribution && serviceStats.length > 0) {
      printContent += `
        <h2>Distribuzione Tipi di Servizio</h2>
        <div class="chart-placeholder">
          <p><strong>Grafico Distribuzione Servizi</strong></p>
          <p>I servizi più richiesti nel periodo:</p>
        </div>
        <ul class="service-list">
          ${serviceStats.slice(0, 5).map(service => `
            <li class="service-item">
              <span><strong>${service.name}</strong></span>
              <span>${service.value} appuntamenti (${service.percentage}%)</span>
            </li>
          `).join('')}
        </ul>
      `;
    }

    if (printOptions.services && serviceStats.length > 0) {
      printContent += `
        <h2>Dettaglio Servizi</h2>
        <ul class="service-list">
          ${serviceStats.map(service => `
            <li class="service-item">
              <span><strong>${service.name}</strong></span>
              <span>${service.value} appuntamenti (${service.percentage}%)</span>
            </li>
          `).join('')}
        </ul>
      `;
    }

    if (printOptions.employees && employeeStats.length > 0) {
      printContent += `<h2>Statistiche per Dipendente</h2>`;
      
      employeeStats.forEach(employee => {
        printContent += `
          <div class="employee-section">
            <h3>${employee.name} - ${employee.specialization}</h3>
            <p><strong>Appuntamenti totali:</strong> ${employee.totalAppointments} | <strong>Clienti unici:</strong> ${employee.uniqueClients}</p>
            
            ${employee.serviceBreakdown.length > 0 ? `
              <h4>Servizi erogati:</h4>
              <div class="service-breakdown">
                ${employee.serviceBreakdown.map(service => `
                  <div class="service-chip">
                    <strong>${service.serviceType}:</strong> ${service.count}
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${printOptions.clientDetails && employee.clientDetails.length > 0 ? `
              <h4>Dettaglio Clienti (ultimi ${Math.min(employee.clientDetails.length, 12)}):</h4>
              <div class="client-grid">
                ${employee.clientDetails.slice(0, 12).map(client => `
                  <div class="client-item">
                    <strong>${client.client}</strong><br>
                    ${format(new Date(client.date), 'dd/MM/yyyy', { locale: it })} alle ${client.time}<br>
                    <em>${client.serviceType} (${client.duration} min)</em>
                  </div>
                `).join('')}
              </div>
              ${employee.clientDetails.length > 12 ? `<p><em>...e altri ${employee.clientDetails.length - 12} appuntamenti</em></p>` : ''}
            ` : ''}
          </div>
        `;
      });
    }

    printContent += `
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
    
    setIsPrintDialogOpen(false);
  };

  const chartConfig = {
    serviceType: {
      label: "Tipo di Servizio",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <SimpleHeader 
          title="Statistiche Appuntamenti"
          subtitle={`Periodo: ${formatPeriodLabel()} - ${specializationFilter === 'all' ? 'Tutte le specializzazioni' : specializationFilter}`}
        >
          <Button
            variant="outline"
            onClick={onBack}
            className="h-10 w-10 rounded-full shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto h-10 px-4">
                <Printer className="h-4 w-4 mr-2" />
                Stampa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Opzioni di Stampa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="summary"
                    checked={printOptions.summary}
                    onCheckedChange={(checked) => setPrintOptions(prev => ({ ...prev, summary: checked as boolean }))}
                  />
                  <label htmlFor="summary" className="text-sm font-medium">Riepilogo Generale</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="serviceDistribution"
                    checked={printOptions.serviceDistribution}
                    onCheckedChange={(checked) => setPrintOptions(prev => ({ ...prev, serviceDistribution: checked as boolean }))}
                  />
                  <label htmlFor="serviceDistribution" className="text-sm font-medium">Distribuzione Tipi di Servizio</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="services"
                    checked={printOptions.services}
                    onCheckedChange={(checked) => setPrintOptions(prev => ({ ...prev, services: checked as boolean }))}
                  />
                  <label htmlFor="services" className="text-sm font-medium">Dettaglio Servizi</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="employees"
                    checked={printOptions.employees}
                    onCheckedChange={(checked) => setPrintOptions(prev => ({ ...prev, employees: checked as boolean }))}
                  />
                  <label htmlFor="employees" className="text-sm font-medium">Statistiche Dipendenti</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="clientDetails"
                    checked={printOptions.clientDetails}
                    onCheckedChange={(checked) => setPrintOptions(prev => ({ ...prev, clientDetails: checked as boolean }))}
                  />
                  <label htmlFor="clientDetails" className="text-sm font-medium">Dettaglio Clienti</label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handlePrint} className="flex-1">
                    Stampa Selezionate
                  </Button>
                  <Button variant="outline" onClick={() => setIsPrintDialogOpen(false)}>
                    Annulla
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </SimpleHeader>

        {/* Enhanced filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 sm:mb-8">
          <Select value={timeFilter} onValueChange={(value: TimeFilter) => setTimeFilter(value)}>
            <SelectTrigger className="h-10 sm:h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Giorno</SelectItem>
              <SelectItem value="week">Settimana</SelectItem>
              <SelectItem value="month">Mese</SelectItem>
              <SelectItem value="year">Anno</SelectItem>
            </SelectContent>
          </Select>
          
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="h-10 sm:h-12 px-3 border border-gray-300 rounded-md text-sm sm:text-base"
          />

          <Select value={specializationFilter} onValueChange={(value: SpecializationFilter) => setSpecializationFilter(value)}>
            <SelectTrigger className="h-10 sm:h-12">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le specializzazioni</SelectItem>
              <SelectItem value="Parrucchiere">Solo Parrucchiere</SelectItem>
              <SelectItem value="Estetista">Solo Estetista</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale Appuntamenti</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{filteredAppointments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clienti Unici</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {new Set(filteredAppointments.map(app => app.client)).size}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dipendenti Attivi</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{employeeStats.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Servizi Diversi</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{serviceStats.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Grafico circolare dei servizi */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Distribuzione Tipi di Servizio</CardTitle>
          </CardHeader>
          <CardContent>
            {serviceStats.length > 0 ? (
              <div className="w-full h-[300px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {serviceStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded-lg shadow-lg">
                              <p className="font-medium">{data.name}</p>
                              <p className="text-sm text-gray-600">
                                Appuntamenti: {data.value} ({data.percentage}%)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Nessun dato disponibile per il periodo selezionato
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabella dettagliata dei servizi */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Dettaglio Servizi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[350px] overflow-y-auto">
              {serviceStats.length > 0 ? serviceStats.map((service, index) => (
                <div key={service.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div 
                      className="w-4 h-4 rounded-full shrink-0" 
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <span className="font-medium text-sm sm:text-base truncate">{service.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-base sm:text-lg">{service.value}</div>
                    <div className="text-xs sm:text-sm text-gray-600">{service.percentage}%</div>
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-500 py-8">
                  Nessun servizio nel periodo selezionato
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced employee statistics with client details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Statistiche per Dipendente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 sm:space-y-6">
              {employeeStats.length > 0 ? employeeStats.map((employee) => (
                <div key={employee.id} className="border rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-4">
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold truncate">{employee.name}</h3>
                      <p className="text-sm text-gray-600">{employee.specialization}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <span className="text-xs sm:text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded shrink-0 text-center">
                        {employee.totalAppointments} appuntamenti
                      </span>
                      <span className="text-xs sm:text-sm bg-green-100 text-green-800 px-2 py-1 rounded shrink-0 text-center">
                        {employee.uniqueClients} clienti unici
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                    {employee.serviceBreakdown.map((service) => (
                      <div key={service.serviceType} className="bg-gray-50 p-3 rounded text-center">
                        <div className="font-medium text-xs sm:text-sm truncate">{service.serviceType}</div>
                        <div className="text-lg sm:text-xl font-bold text-blue-600">{service.count}</div>
                      </div>
                    ))}
                  </div>

                  {/* Client details section */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-3">Ultimi Clienti:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {employee.clientDetails.slice(0, 8).map((client, index) => (
                        <div key={index} className="bg-gray-50 p-2 rounded-lg text-xs">
                          <div className="font-medium text-gray-800 truncate">{client.client}</div>
                          <div className="text-gray-600">
                            {format(new Date(client.date), 'dd/MM', { locale: it })} alle {client.time}
                          </div>
                          <div className="text-gray-500">
                            {client.serviceType} ({client.duration} min)
                          </div>
                        </div>
                      ))}
                    </div>
                    {employee.clientDetails.length > 8 && (
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        ...e altri {employee.clientDetails.length - 8} appuntamenti
                      </p>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-500 py-8">
                  Nessun dipendente ha appuntamenti nel periodo selezionato
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;
