
import { DriverKioskForm } from '@/components/DriverKioskForm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ClipboardPen } from 'lucide-react';

export default function DriverKioskPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <ClipboardPen className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline">Driver Kiosk Sign-In</CardTitle>
          <CardDescription className="text-lg">
            Welcome! Please provide your details to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DriverKioskForm />
        </CardContent>
      </Card>
    </div>
  );
}
