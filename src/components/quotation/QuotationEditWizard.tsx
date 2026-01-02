'use client';

import { useEffect } from 'react';
import { useQuotationStore } from '@/stores/quotationStore';
import type { Client, QuotationItem, LaborCost, LogisticsCost, MaterialCost, EquipmentCost } from '@/types/database';
import StepClient from './steps/StepClient';
import StepServices from './steps/StepServices';
import StepCosts from './steps/StepCosts';
import StepEditSummary from './steps/StepEditSummary';

interface InitialData {
  quotationId: string;
  client: Client | null;
  quotationType: 'small' | 'large';
  currency: 'PEN' | 'USD';
  durationDays: number;
  marginPercentage: number;
  validityDays: number;
  paymentTerms: string;
  notes: string;
  items: QuotationItem[];
  laborCosts: LaborCost[];
  logisticsCosts: LogisticsCost[];
  materialCosts: MaterialCost[];
  equipmentCosts: EquipmentCost[];
}

interface QuotationEditWizardProps {
  initialData: InitialData;
}

const steps = [
  { id: 0, name: 'Cliente', description: 'Datos del cliente' },
  { id: 1, name: 'Servicios', description: 'Items de la cotización' },
  { id: 2, name: 'Costos', description: 'Costos operativos' },
  { id: 3, name: 'Resumen', description: 'Revisión y precio final' },
];

export default function QuotationEditWizard({ initialData }: QuotationEditWizardProps) {
  const store = useQuotationStore();

  // Cargar datos iniciales al montar
  useEffect(() => {
    // Reset primero
    store.reset();

    // Cargar cliente
    if (initialData.client) {
      store.setClient(initialData.client);
    }

    // Cargar configuración
    store.setQuotationType(initialData.quotationType);
    store.setCurrency(initialData.currency);
    store.setDurationDays(initialData.durationDays);
    store.setMarginPercentage(initialData.marginPercentage);
    store.setValidityDays(initialData.validityDays);
    store.setPaymentTerms(initialData.paymentTerms);
    store.setNotes(initialData.notes);

    // Cargar items directamente en el state (bypass addItem para mantener IDs)
    useQuotationStore.setState({ items: initialData.items });

    // Cargar costos
    useQuotationStore.setState({ laborCosts: initialData.laborCosts });
    useQuotationStore.setState({ logisticsCosts: initialData.logisticsCosts });
    useQuotationStore.setState({ materialCosts: initialData.materialCosts });
    useQuotationStore.setState({ equipmentCosts: initialData.equipmentCosts });
  }, []);

  const { currentStep, goToStep } = store;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepClient />;
      case 1:
        return <StepServices />;
      case 2:
        return <StepCosts />;
      case 3:
        return <StepEditSummary quotationId={initialData.quotationId} />;
      default:
        return <StepClient />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Steps */}
      <nav aria-label="Progress" className="mb-8">
        <ol className="flex items-center">
          {steps.map((step, stepIdx) => (
            <li
              key={step.name}
              className={`relative ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div className="flex items-center">
                <button
                  onClick={() => goToStep(step.id)}
                  className={`
                    relative flex h-10 w-10 items-center justify-center rounded-full
                    ${
                      step.id < currentStep
                        ? 'bg-[#1E3A8A] hover:bg-[#1E3A8A]/90'
                        : step.id === currentStep
                        ? 'border-2 border-[#1E3A8A] bg-white'
                        : 'border-2 border-gray-300 bg-white'
                    }
                    transition-colors
                  `}
                >
                  {step.id < currentStep ? (
                    <svg
                      className="h-5 w-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span
                      className={`text-sm font-semibold ${
                        step.id === currentStep ? 'text-[#1E3A8A]' : 'text-gray-500'
                      }`}
                    >
                      {step.id + 1}
                    </span>
                  )}
                </button>
                {stepIdx !== steps.length - 1 && (
                  <div
                    className={`
                      hidden sm:block h-0.5 w-full ml-4
                      ${step.id < currentStep ? 'bg-[#1E3A8A]' : 'bg-gray-300'}
                    `}
                  />
                )}
              </div>
              <div className="mt-2 hidden sm:block">
                <span
                  className={`text-sm font-medium ${
                    step.id <= currentStep ? 'text-[#1E3A8A]' : 'text-gray-500'
                  }`}
                >
                  {step.name}
                </span>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </nav>

      {/* Mobile Step Indicator */}
      <div className="sm:hidden mb-6">
        <p className="text-sm font-medium text-gray-500">
          Paso {currentStep + 1} de {steps.length}
        </p>
        <h2 className="text-lg font-semibold text-[#1E3A8A]">
          {steps[currentStep].name}
        </h2>
        <p className="text-sm text-gray-500">{steps[currentStep].description}</p>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">{renderStep()}</div>
    </div>
  );
}
