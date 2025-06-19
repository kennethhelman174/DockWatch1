
"use client";

import * as React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ClipboardCheck, Loader2, ShieldCheck, ListChecks } from 'lucide-react';
import { Label as ShadCnLabel } from '@/components/ui/label'; // Using direct import for clarity

const safetyAuditQuestions = [
  { id: 'safety_walkways_clear', label: 'Are walkways clear and unobstructed?' },
  { id: 'safety_fire_extinguishers', label: 'Are fire extinguishers accessible and charged?' },
  { id: 'safety_emergency_exits', label: 'Are emergency exits clear and functional?' },
  { id: 'safety_dock_plates_condition', label: 'Are dock plates in good condition and properly secured?' },
  { id: 'safety_trailer_wheels_chocked', label: 'Are trailer wheels chocked (if applicable)?' },
  { id: 'safety_dock_locks_use', label: 'Are dock locks/glad hand locks in use (if applicable)?' },
  { id: 'safety_ppe_use', label: 'Is personal protective equipment (PPE) being used correctly?' },
  { id: 'safety_spill_kits_available', label: 'Are spill kits available and stocked?' },
  { id: 'safety_lighting_adequate', label: 'Is lighting adequate in all work areas?' },
  { id: 'safety_signs_visible', label: 'Are safety signs visible and in good condition?' },
];

const operationalAuditQuestions = [
  { id: 'ops_dock_assignments_followed', label: 'Are dock assignments being followed?' },
  { id: 'ops_staging_area_organized', label: 'Is staging area organized and efficient?' },
  { id: 'ops_procedures_followed', label: 'Are loading/unloading procedures being followed?' },
  { id: 'ops_equipment_condition', label: 'Is equipment (forklifts, pallet jacks) in good working order?' },
  { id: 'ops_turnaround_times_met', label: 'Are trailers being processed within target turnaround times?' },
  { id: 'ops_communication_clear', label: 'Is communication between yard and dock staff clear?' },
  { id: 'ops_paperwork_accurate', label: 'Is paperwork accurate and complete?' },
  { id: 'ops_dock_areas_clean', label: 'Are dock areas clean and free of debris?' },
  { id: 'ops_damages_reported', label: 'Are damages or exceptions being reported correctly?' },
  { id: 'ops_personnel_aware_priorities', label: 'Are dock personnel aware of current priorities?' },
];

// Dynamically create Zod schemas based on questions
const createAuditSchema = (questions: { id: string }[]) => {
  const schemaFields = questions.reduce((acc, q) => {
    acc[q.id] = z.boolean().default(false);
    return acc;
  }, {} as Record<string, z.ZodBoolean>);
  return z.object(schemaFields);
};

const safetyAuditSchema = createAuditSchema(safetyAuditQuestions);
type SafetyAuditFormData = z.infer<typeof safetyAuditSchema>;

const operationalAuditSchema = createAuditSchema(operationalAuditQuestions);
type OperationalAuditFormData = z.infer<typeof operationalAuditSchema>;


export default function DockAuditsPage() {
  const { toast } = useToast();
  const [isLoadingSafety, setIsLoadingSafety] = React.useState(false);
  const [isLoadingOps, setIsLoadingOps] = React.useState(false);

  const safetyForm = useForm<SafetyAuditFormData>({
    resolver: zodResolver(safetyAuditSchema),
    defaultValues: safetyAuditQuestions.reduce((acc, q) => ({ ...acc, [q.id]: false }), {}),
  });

  const operationalForm = useForm<OperationalAuditFormData>({
    resolver: zodResolver(operationalAuditSchema),
    defaultValues: operationalAuditQuestions.reduce((acc, q) => ({ ...acc, [q.id]: false }), {}),
  });

  const onSafetySubmit: SubmitHandler<SafetyAuditFormData> = async (data) => {
    setIsLoadingSafety(true);
    console.log("Safety Audit Data:", data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoadingSafety(false);
    toast({
      title: "Safety Audit Submitted",
      description: "The safety audit has been successfully logged.",
      variant: "success",
    });
    safetyForm.reset();
  };

  const onOperationalSubmit: SubmitHandler<OperationalAuditFormData> = async (data) => {
    setIsLoadingOps(true);
    console.log("Operational Audit Data:", data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoadingOps(false);
    toast({
      title: "Operational Audit Submitted",
      description: "The operational audit has been successfully logged.",
      variant: "success",
    });
    operationalForm.reset();
  };

  const renderAuditForm = (
    form: any, // react-hook-form useForm return type is complex
    questions: { id: string; label: string }[],
    onSubmitHandler: SubmitHandler<any>,
    isLoading: boolean,
    formType: "Safety" | "Operational"
  ) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)}>
        <CardContent className="space-y-5 pt-6">
          {questions.map((question) => (
            <FormField
              key={question.id}
              control={form.control}
              name={question.id}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-labelledby={`${question.id}-label`}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <ShadCnLabel htmlFor={field.name} id={`${question.id}-label`} className="font-normal text-sm">
                      {question.label}
                    </ShadCnLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          ))}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              `Submit ${formType} Audit`
            )}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <ClipboardCheck className="mr-3 h-8 w-8 text-primary" /> Dock Audits
        </h1>
        <p className="text-muted-foreground mt-1">
          Complete daily safety and operational checklists for docks.
        </p>
      </div>

      <Tabs defaultValue="safety_audit" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="safety_audit">
            <ShieldCheck className="mr-2 h-4 w-4" /> Safety Audit
          </TabsTrigger>
          <TabsTrigger value="operational_audit">
            <ListChecks className="mr-2 h-4 w-4" /> Operational Audit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="safety_audit">
          <Card>
            <CardHeader>
              <CardTitle>Daily Safety Audit Checklist</CardTitle>
              <CardDescription>
                Verify all safety points are checked and confirmed.
              </CardDescription>
            </CardHeader>
            {renderAuditForm(safetyForm, safetyAuditQuestions, onSafetySubmit, isLoadingSafety, "Safety")}
          </Card>
        </TabsContent>

        <TabsContent value="operational_audit">
          <Card>
            <CardHeader>
              <CardTitle>Daily Operational Audit Checklist</CardTitle>
              <CardDescription>
                Verify all operational points are checked and confirmed.
              </CardDescription>
            </CardHeader>
            {renderAuditForm(operationalForm, operationalAuditQuestions, onOperationalSubmit, isLoadingOps, "Operational")}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
