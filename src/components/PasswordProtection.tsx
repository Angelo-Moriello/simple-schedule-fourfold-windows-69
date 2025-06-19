
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

interface PasswordProtectionProps {
  children: React.ReactNode;
}

const PasswordProtection = ({ children }: PasswordProtectionProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  useEffect(() => {
    // Verifica se c'è già una password impostata
    const storedPassword = localStorage.getItem('appPassword');
    const authStatus = sessionStorage.getItem('isAuthenticated');
    
    if (!storedPassword) {
      setIsSettingPassword(true);
    } else {
      setAppPassword(storedPassword);
      if (authStatus === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleSetPassword = () => {
    if (password.length < 4) {
      toast.error('La password deve essere di almeno 4 caratteri');
      return;
    }
    localStorage.setItem('appPassword', password);
    setAppPassword(password);
    setIsAuthenticated(true);
    sessionStorage.setItem('isAuthenticated', 'true');
    setIsSettingPassword(false);
    toast.success('Password impostata con successo!');
  };

  const handleLogin = () => {
    if (password === appPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('isAuthenticated', 'true');
      toast.success('Accesso effettuato con successo!');
    } else {
      toast.error('Password non corretta');
      setPassword('');
    }
  };

  const handleChangePassword = () => {
    const newPassword = prompt('Inserisci la nuova password (minimo 4 caratteri):');
    if (newPassword && newPassword.length >= 4) {
      localStorage.setItem('appPassword', newPassword);
      setAppPassword(newPassword);
      toast.success('Password cambiata con successo!');
    } else if (newPassword) {
      toast.error('La password deve essere di almeno 4 caratteri');
    }
  };

  if (isSettingPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/e3330001-9a6b-4c26-a431-89d19870edfe.png" 
                alt="Da Capo a Piedi" 
                className="h-16 w-16 object-contain rounded-lg shadow-sm"
              />
            </div>
            <CardTitle className="text-2xl font-bold">Imposta Password</CardTitle>
            <p className="text-gray-600">Scegli una password per proteggere l'applicazione</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Inserisci password (min. 4 caratteri)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSetPassword()}
            />
            <Button onClick={handleSetPassword} className="w-full">
              <Lock className="h-4 w-4 mr-2" />
              Imposta Password
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/e3330001-9a6b-4c26-a431-89d19870edfe.png" 
                alt="Da Capo a Piedi" 
                className="h-16 w-16 object-contain rounded-lg shadow-sm"
              />
            </div>
            <CardTitle className="text-2xl font-bold">Accesso Richiesto</CardTitle>
            <p className="text-gray-600">Inserisci la password per accedere</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <div className="space-y-2">
              <Button onClick={handleLogin} className="w-full">
                <Lock className="h-4 w-4 mr-2" />
                Accedi
              </Button>
              <Button 
                onClick={handleChangePassword} 
                variant="outline" 
                className="w-full text-sm"
              >
                Cambia Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default PasswordProtection;
