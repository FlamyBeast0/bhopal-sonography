
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { Patient, PaymentMode, PatientType, ReferralStatus, RateCardItem, NewPatientData } from '../../services/types';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface NewEntryProps {
    setActiveSection: (section: string) => void;
}

const NewEntry: React.FC<NewEntryProps> = ({ setActiveSection }) => {
  const { addPatient, rateCard, patients } = useContext(AppContext);
  const initialState: NewPatientData = {
    date: new Date().toISOString().split('T')[0],
    name: '',
    age: 0,
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    contact: '',
    doctorRef: '',
    testId: '',
    mrp: 0,
    amountReceived: 0,
    paymentMode: PaymentMode.Cash,
    remarks: '',
    receivedBy: '',
    patientType: PatientType.Direct,
    pro: '',
    referralAmount: 0,
    referralStatus: ReferralStatus.Pending,
    paidDate: '',
    paidTo: '',
  };
  
  const [formData, setFormData] = useState<NewPatientData>(initialState);
  const [amountDifference, setAmountDifference] = useState(0);
  const [receiptData, setReceiptData] = useState<Patient | null>(null);

  // Smart Doctor Suggestions: Extract unique doctor names from existing patients
  const doctorSuggestions = useMemo(() => {
    const doctors = patients
        .map(p => p.doctorRef)
        .filter(d => d && d.trim().length > 0);
    return [...new Set(doctors)].sort();
  }, [patients]);

  useEffect(() => {
    const selectedTest = rateCard.find(item => item.id === formData.testId);
    if (selectedTest) {
      setFormData(prev => ({
        ...prev,
        mrp: selectedTest.mrp,
      }));
    } else {
      setFormData(prev => ({ ...prev, mrp: 0 }));
    }
  }, [formData.testId, rateCard]);

  useEffect(() => {
    setAmountDifference(formData.mrp - formData.amountReceived);
  }, [formData.mrp, formData.amountReceived]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // VALIDATION: Contact Number (Numeric only, max 10 digits)
    if (name === 'contact') {
        const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
        setFormData(prev => ({ ...prev, [name]: numericValue }));
        return;
    }

    const numericFields = ['age', 'amountReceived'];
    setFormData(prev => ({ ...prev, [name]: numericFields.includes(name) ? parseFloat(value) || 0 : value } as NewPatientData));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.testId || !formData.contact) {
      alert('Please fill all required fields: Name, Contact, and select a Test.');
      return;
    }
    
    if (formData.contact.length !== 10) {
        alert('Please enter a valid 10-digit contact number.');
        return;
    }
    
    const selectedTest = rateCard.find(item => item.id === formData.testId);
    const referralAmount = selectedTest ? Math.max(0, formData.amountReceived - selectedTest.landingPrice) : 0;

    const finalPatientData: NewPatientData = {
        ...formData,
        referralAmount: referralAmount,
        paidDate: formData.paidDate || undefined,
        paidTo: formData.paidTo || undefined,
    };
    const newPatient = addPatient(finalPatientData);
    setReceiptData(newPatient);
    setFormData(initialState);
  };

  const handleClear = () => {
    setFormData(initialState);
  };
  
  const handlePrint = () => {
    window.print();
  };

  const closeReceiptModal = () => {
    setReceiptData(null);
    setActiveSection('Patients');
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Patient Details">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input label="Date" type="date" name="date" value={formData.date} onChange={handleChange} required />
              <Input label="Patient Name" name="name" value={formData.name} onChange={handleChange} required />
              <Input label="Age" type="number" name="age" value={formData.age === 0 ? '' : formData.age} onChange={handleChange} required min="0" />
              <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </Select>
              <Input 
                label="Contact Number" 
                name="contact" 
                value={formData.contact} 
                onChange={handleChange} 
                required 
                placeholder="10-digit mobile number"
                maxLength={10}
              />
            </div>
        </Card>
        
        <Card title="Test & Payment Details">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Select label="Test/Study" name="testId" value={formData.testId} onChange={handleChange} required containerClassName="lg:col-span-1">
                    <option value="">Select a test</option>
                    {rateCard.map((item: RateCardItem) => (
                        <option key={item.id} value={item.id}>{item.studyName}</option>
                    ))}
                </Select>
                <Input label="MRP" name="mrp" value={formData.mrp} readOnly disabled />
                <Input label="Amount Received" type="number" name="amountReceived" value={formData.amountReceived === 0 ? '' : formData.amountReceived} onChange={handleChange} required min="0"/>
                <Input label="Amount Difference" value={amountDifference} readOnly disabled />
                <Select label="Payment Mode" name="paymentMode" value={formData.paymentMode} onChange={handleChange}>
                    {(Object.values(PaymentMode) as string[]).map(mode => <option key={mode} value={mode}>{mode}</option>)}
                </Select>
                 <Input label="Person Who Received Amount" name="receivedBy" value={formData.receivedBy} onChange={handleChange} />
                <Input label="Remarks/Difference Explanation" name="remarks" value={formData.remarks} onChange={handleChange} containerClassName="lg:col-span-3"/>
            </div>
        </Card>

        <Card title="Referral Details">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Select label="Patient Type" name="patientType" value={formData.patientType} onChange={handleChange}>
                    {(Object.values(PatientType) as string[]).map(type => <option key={type} value={type}>{type}</option>)}
                </Select>
                <Input 
                    label="Reference Doctor/Person" 
                    name="doctorRef" 
                    value={formData.doctorRef} 
                    onChange={handleChange} 
                    placeholder="Dr. Name or Person" 
                    list="doctor-suggestions"
                />
                {/* Autocomplete Datalist */}
                <datalist id="doctor-suggestions">
                    {doctorSuggestions.map((doctor, index) => (
                        <option key={index} value={doctor} />
                    ))}
                </datalist>

                <Input label="PRO / Care Of" name="pro" value={formData.pro} onChange={handleChange} />
                <Select label="Referral Amount Status" name="referralStatus" value={formData.referralStatus} onChange={handleChange}>
                    {(Object.values(ReferralStatus) as string[]).map(status => <option key={status} value={status}>{status}</option>)}
                </Select>
                <Input label="Paid Date" type="date" name="paidDate" value={formData.paidDate || ''} onChange={handleChange} />
                <Input label="Paid To" name="paidTo" value={formData.paidTo || ''} onChange={handleChange} />
            </div>
        </Card>

        <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="secondary" onClick={handleClear}>Clear</Button>
            <Button type="submit">Save Patient & Get Token</Button>
        </div>
      </form>

      {receiptData && (
        <Modal isOpen={!!receiptData} onClose={closeReceiptModal} title="Patient Receipt">
            <div id="receipt-content" className="text-gray-800 dark:text-gray-200 p-4">
                 <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">Bhopal Sonography Center</h2>
                    <p className="text-sm">Patient Receipt</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-lg mb-6">
                    <div><strong>Patient:</strong> {receiptData.name}</div>
                    <div><strong>Date:</strong> {receiptData.date}</div>
                    <div className="col-span-2"><strong>Test:</strong> {rateCard.find(t => t.id === receiptData.testId)?.studyName}</div>
                </div>
                <div className="text-center border-t-2 border-dashed pt-6">
                    <p className="text-2xl font-semibold uppercase">Token Number</p>
                    <p className="text-8xl font-bold text-primary-600 dark:text-primary-400 my-4">{receiptData.tokenNumber}</p>
                    <p className="text-lg">Please wait for your turn.</p>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4" id="receipt-actions">
                <Button variant="secondary" onClick={closeReceiptModal}>Close</Button>
                <Button onClick={handlePrint}>Print Receipt</Button>
            </div>
        </Modal>
      )}
      <style>{`
        @media print {
            body > *:not(#root), #root > *:not(.fixed.inset-0) {
                display: none !important;
            }
            .fixed.inset-0 > div {
                display: none !important;
            }
            .fixed.inset-0 {
                background: none !important;
            }
            .fixed.inset-0 > .bg-white { /* The modal content */
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
                height: 100% !important;
                box-shadow: none !important;
                border: none !important;
                transform: none !important;
                animation: none !important;
            }
            #receipt-actions, .fixed.inset-0 .flex.justify-between {
                display: none !important;
            }
            #receipt-content {
                color: #000 !important;
            }
        }
      `}</style>
      </>
  );
};

export default NewEntry;
