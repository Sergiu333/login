"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Page,
  Layout,
  Card,
  DataTable,
  Button,
  Popover,
  DatePicker,
  Select,
  TextField,
  Modal,
  Banner,
  Box,
  Text,
  BlockStack,
  InlineStack,
  ButtonGroup,
  Badge,
} from "@shopify/polaris";
import {useRouter} from "next/navigation";

type BadgeTone = 'success' | 'info' | 'warning' | 'critical' | 'attention';

interface VisaTransaction {
  id: string;
  terminal: string;
  trtype: string;
  order: string;
  amount: string;
  currency: string;
  action: string;
  rc: string;
  approval: string;
  rrn: string;
  intRef: string;
  timestamp: string;
  nonce: string;
  pSign: string;
  eci: string;
  text: string;
  formattedTimestamp: string;
}

interface MIATransaction {
  id: string;
  date: string;
  time: string;
  payerName: string;
  payerIdnp: string;
  beneficiaryIdnp: string;
  transactionType: string;
  transactionAmount: string;
  transactionStatus: string;
  destinationBankName: string;
  transactionMessage: string;
  paymentType: string;
  created_at: string;
  miaId: string;
}

// Mock data for development
const mockVisaTransactions: VisaTransaction[] = [
  {
    id: "1",
    terminal: "TEST001",
    trtype: "Purchase",
    order: "ORD123",
    amount: "100.00",
    currency: "MDL",
    action: "SUCCESS",
    rc: "00",
    approval: "123456",
    rrn: "123456789",
    intRef: "REF123",
    timestamp: "2024-03-20 10:00:00",
    nonce: "abc123",
    pSign: "xyz789",
    eci: "05",
    text: "Successful transaction",
    formattedTimestamp: "2024-03-20 10:00:00"
  }
];

const mockMiaTransactions: MIATransaction[] = [
  {
    id: "1",
    date: "2024-03-20T10:00:00",
    time: "10:00:00",
    payerName: "Ion Popescu",
    payerIdnp: "1234567890123",
    beneficiaryIdnp: "0987654321098",
    transactionType: "Standard",
    transactionAmount: "150.00",
    transactionStatus: "Completed",
    destinationBankName: "Banca Națională",
    transactionMessage: "Payment successful",
    paymentType: "Standard",
    created_at: "2024-03-20T10:00:00",
    miaId: "1"
  }
];

export default function TransactionsPage() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("visa-mastercard");
  const [environment, setEnvironment] = useState<"production" | "test">("production");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
    end: new Date()
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionStatus, setActionStatus] = useState<{ type: string; success: boolean; message: string } | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnAmount, setReturnAmount] = useState("");
  const [returnComment, setReturnComment] = useState("");
  const [returnError, setReturnError] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [miaTransactions, setMiaTransactions] = useState<MIATransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const getTrtypeDescription = (trtype: string) => {
    switch (trtype) {
      case '0':
        return 'Plată';
      case '21':
        return 'Finalizare';
      case '22':
        return 'Anulare';
      case '24':
        return 'Returnare';
      default:
        return trtype || '-';
    }
  };

  const getRcBadge = (rc: string) => {
    switch (rc) {
      case '00':
        return <Badge tone="success">{rc}</Badge>;
      case '':
      case null:
      case undefined:
        return '-';
      default:
        return <Badge tone="critical">{rc}</Badge>;
    }
  };

  const tableHeaders = [
    'Status',
    'Terminal',
    'TRTYPE',
    'ORDER',
    'Sumă',
    'Valută',
    'Action',
    'RC',
    'Approval',
    'RRN',
    'INT REF',
    'Timestamp',
    'Nonce',
    'Semnătură',
    'ECI',
    'Mesaj',
    'Acțiuni'
  ];



  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      // Nu resetăm imediat transactions pentru a evita flash-ul
      let newTransactions: any[] = [];

      if (selectedPaymentMethod === "visa-mastercard") {
        const merchantId = environment === "test" ? "498000049809001" : "498000049809001";
        
        const response = await fetch('https://api.ecompay.md/api/transactions?' + new URLSearchParams({
          merchantId,
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString(),
          searchTerm: searchTerm || ''
        }));
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch transactions');
        }
        
        const data = await response.json();
         
        newTransactions = data.map((t: any) => {
          // Determinăm statusul bazat pe trtype
          let status;
          switch (t.trtype) {
            case '0':
              status = <Badge tone="success">Success</Badge>;
              break;
            case '21':
              status = <Badge tone="success">Finalizată</Badge>;
              break;
            case '22':
              status = <Badge tone="critical">Anulată</Badge>;
              break;
            case '24':
              status = <Badge tone="info">Returnată</Badge>;
              break;
            default:
              status = <Badge tone="attention">Necunoscut</Badge>;
          }

          return [
            status,                     // Status bazat pe trtype
            t.terminal || '-',          // Terminal
            t.trtype || '-',           // TRTYPE
            t.ORDER || '-',            // ORDER
            t.amount || '0',           // Sumă
            t.currency || 'MDL',       // Valută
            t.action || '-',           // Action
            getRcBadge(t.rc),          // RC
            t.approval || '-',         // Approval
            t.rrn || '-',             // RRN
            t.int_ref || '-',         // INT REF
            t.formattedTimestamp || '-', // Timestamp
            t.nonce || '-',           // Nonce
            t.p_sign || '-',          // Semnătură
            t.eci || '-',             // ECI
            t.text || '-',            // Mesaj
            <Button onClick={() => handleViewDetails(t)}>Vezi detalii</Button>
          ];
        });
      } else if (selectedPaymentMethod === "mia") {
        const response = await fetch(`https://api.ecompay.md/api/mia/sync?startDate=${dateRange.start.toISOString().split('T')[0]}&endDate=${dateRange.end.toISOString().split('T')[0]}`);
        if (!response.ok) {
          throw new Error("Failed to fetch MIA transactions");
        }

        const data = await response.json();

        newTransactions = data.map((t: MIATransaction) => {
          // Formatăm data și ora pentru afișare
          const [year, month, day] = t.date.split('T')[0].split('-');
          const formattedDate = `${day}.${month}.${year}`;
          const formattedTime = t.time || '-';

          return [
            t.miaId || "-",                        // MIA ID
            formattedDate,                         // Data formatată
            formattedTime,                         // Ora
            t.payerName || "-",                    // Nume Plătitor
            `${t.transactionAmount} MDL`,          // Sumă
            t.paymentType || "-",                  // Tip plată
            t.transactionMessage || "-",           // Mesaj
            <Button onClick={() => handleViewDetails(t)}>Detalii</Button> // Acțiuni
          ];
        });
      }

      // Actualizăm starea doar după ce avem noile date
      setTransactions(newTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [selectedPaymentMethod, environment, dateRange.start, dateRange.end, searchTerm]);

  const handleViewDetails = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsDetailsModalOpen(true);
  };

  const toggleDatePicker = () => setIsDatePickerOpen(!isDatePickerOpen);
  const handleDatePickerClose = () => setIsDatePickerOpen(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ro-RO');
  };

  const getMiaStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <Badge tone={'success' as BadgeTone}>Finalizată</Badge>;
      case 'pending':
        return <Badge tone={'warning' as BadgeTone}>În așteptare</Badge>;
      case 'failed':
        return <Badge tone={'critical' as BadgeTone}>Eșuată</Badge>;
      default:
        return <Badge tone={'attention' as BadgeTone}>Necunoscut</Badge>;
    }
  };

  const getVisaStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':
        return <Badge tone={'success' as BadgeTone}>Success</Badge>;
      case 'PENDING':
        return <Badge tone={'warning' as BadgeTone}>În așteptare</Badge>;
      case 'FAILED':
        return <Badge tone={'critical' as BadgeTone}>Eșuat</Badge>;
      default:
        return <Badge tone={'attention' as BadgeTone}>Necunoscut</Badge>;
    }
  };

  const paymentMethodOptions = [
    { label: "Visa/Mastercard", value: "visa-mastercard" },
    { label: "MIA", value: "mia" },
  ];

  const visaRows = transactions.map(transaction => [
    transaction[0],
    getVisaStatusBadge(transaction[1]),
    transaction[2],
    transaction[3],
    `${transaction[4]}`,
    transaction[5],
    transaction[6],
    transaction[7],
    transaction[8],
    transaction[9],
    transaction[10],
    transaction[11],
    transaction[12],
    transaction[13],
    transaction[14],
    <Button key="view" onClick={() => handleViewDetails(transaction)}>
      Vezi detalii
    </Button>
  ]);

  const miaRows = transactions.map(transaction => [
    transaction[0], // formattedDate
    transaction[1], // formattedTime
    transaction[2], // payerName
    transaction[3], // payerIdnp
    transaction[4], // transactionAmount
    getMiaStatusBadge(transaction[5]), // transactionStatus
    transaction[6], // destinationBankName
    transaction[7], // paymentType
    transaction[8], // transactionMessage
    <Button key="view" onClick={() => handleViewDetails(transaction)}>
      Vezi detalii
    </Button>
  ]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async () => {
    if (!validateEmail(customerEmail)) {
      setEmailError("Vă rugăm să introduceți un email valid");
      return;
    }

    try {
      // Trimitem email-ul
      const response = await fetch('/api/transactions/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerEmail,
          transaction: selectedTransaction,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      // Închidem modalul de email
      setIsEmailModalOpen(false);
      setCustomerEmail("");
      setEmailError("");

      // Trimitem formularul pentru tranzacție
      submitForm(getTransactionUrl(), 21);

      // Afișăm mesaj de succes
      setActionStatus({
        type: 'email',
        success: true,
        message: 'Email-ul de confirmare a fost trimis cu succes!',
      });
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailError("A apărut o eroare la trimiterea email-ului. Vă rugăm să încercați din nou.");
    }
  };

  const submitForm = (url: string, trtype: number, amount?: string, email?: string) => {
    if (!selectedTransaction) return;

    // Construim URL-ul pentru BACKREF cu parametri pentru a identifica tipul de acțiune
    const backrefUrl = new URL('/transactions', window.location.origin);
   

    const form = document.createElement("form");
    form.action = url;
    form.method = "POST";
    form.target = "_blank";

    form.innerHTML = `
      <input type="hidden" name="AMOUNT" value="${amount || selectedTransaction.amount}" />
      <input type="hidden" name="CURRENCY" value="${selectedTransaction.currency}" />
      <input type="hidden" name="ORDER" value="${selectedTransaction.ORDER}" />
      <input type="hidden" name="DESC" value="${selectedTransaction.text}" />
      <input type="hidden" name="MERCH_NAME" value="Test Merchant" />
      <input type="hidden" name="MERCH_URL" value="${window.location.origin}" />
      <input type="hidden" name="MERCHANT" value="498000049809001" />
      <input type="hidden" name="TERMINAL" value="${selectedTransaction.terminal}" />
      <input type="hidden" name="EMAIL" value="${email || ''}" />
      <input type="hidden" name="TRTYPE" value="${trtype}" />
      <input type="hidden" name="COUNTRY" value="${selectedTransaction.currency}" />
      <input type="hidden" name="NONCE" value="${selectedTransaction.nonce}" />
      <input type="hidden" name="BACKREF" value="${backrefUrl}" />
      <input type="hidden" name="MERCH_GMT" value="2" />
      <input type="hidden" name="TIMESTAMP" value="${selectedTransaction.timestamp}" />
      <input type="hidden" name="P_SIGN" value="${selectedTransaction.p_sign}" />
      <input type="hidden" name="LANG" value="en" />
      <input type="hidden" name="MERCH_ADDRESS" value="${selectedTransaction.merch_address || ''}" />
      <input type="hidden" name="RRN" value="${selectedTransaction.rrn}" />
      <input type="hidden" name="INT_REF" value="${selectedTransaction.int_ref}" />
    `;

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  const getTransactionUrl = () => {
    return environment === "production" 
      ? "https://vb059.vb.md/cgi-bin/cgi_link" 
      : "https://ecomt.victoriabank.md/cgi-bin/cgi_link";
  };

  const handleAction = useCallback(async (action: string) => {
    // Închidem modalul de detalii înainte de a deschide modalul de email
    setIsDetailsModalOpen(false);
    
    switch (action) {
      case 'finalizare':
        // Deschidem modalul de email după un mic delay pentru a permite închiderea modalului de detalii
        setTimeout(() => {
          setIsEmailModalOpen(true);
        }, 100);
        break;
      case 'anulare':
        submitForm(getTransactionUrl(), 22);
        break;
      case 'returnare':
        if (selectedPaymentMethod === "mia") {
          try {
            const response = await fetch('/api/mia/reverse', {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ miaId: selectedTransaction.miaId }),
            });

            if (!response.ok) {
              throw new Error("Failed to reverse MIA transaction");
            }

            setActionStatus({
              type: 'returnare',
              success: true,
              message: 'Returnarea tranzacției MIA a fost inițiată cu succes!'
            });
          } catch (error) {
            console.error('Error reversing MIA transaction:', error);
            setActionStatus({
              type: 'returnare',
              success: false,
              message: 'A apărut o eroare la returnarea tranzacției MIA.'
            });
          }
        } else {
          submitForm(getTransactionUrl(), 24);
        }
        break;
    }
  }, [environment, selectedTransaction, selectedPaymentMethod]);

  const handleReturnClick = useCallback(() => {
    setIsModalOpen(false);
    setIsReturnModalOpen(true);
  }, []);

  const handleReturnSubmit = useCallback(() => {
    const amount = parseFloat(returnAmount);
    const maxAmount = parseFloat(selectedTransaction?.amount || "0");

    if (isNaN(amount) || amount <= 0) {
      setReturnError("Suma trebuie să fie mai mare ca 0");
      return;
    }

    if (amount > maxAmount) {
      setReturnError(`Suma nu poate fi mai mare decât ${maxAmount}`);
      return;
    }

    if (!returnComment.trim()) {
      setReturnError("Comentariul este obligatoriu");
      return;
    }

    submitForm(getTransactionUrl(), 24, returnAmount);

    setActionStatus({
      type: 'returnare',
      success: true,
      message: `Returnarea în valoare de ${amount} ${selectedTransaction?.currency} a fost inițiată cu succes!`,
    });

    setIsReturnModalOpen(false);
    setReturnAmount("");
    setReturnComment("");
    setIsModalOpen(false);
  }, [returnAmount, returnComment, selectedTransaction, environment]);

  const getAvailableActions = useCallback((transaction: any) => {
    // Verificăm tipul tranzacției pentru a determina acțiunile disponibile
    const trtype = transaction?.trtype;
    
    const actions = [];
    
    // Returnarea este disponibilă doar pentru tranzacții de tip 0 (plată) sau 21 (finalizată)
    if (trtype === '0' || trtype === '21') {
      actions.push({
        content: 'Returnare',
        onAction: handleReturnClick,
      });
    }
    
    // Finalizarea este disponibilă doar pentru tranzacții de tip 0 (plată)
    if (trtype === '0') {
      actions.push({
        content: 'Finalizare',
        onAction: () => handleAction('finalizare'),
      });
    }
    
    // Anularea este disponibilă doar pentru tranzacții de tip 0 (plată)
    if (trtype === '0') {
      actions.push({
        content: 'Anulare',
        onAction: () => handleAction('anulare'),
      });
    }
    
    return actions;
  }, [handleAction, handleReturnClick]);

  // Adăugăm useEffect pentru a verifica parametrii URL-ului la încărcarea paginii
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const order = params.get('order');
    const amount = params.get('amount');
    const rc = params.get('rc');
    const error = params.get('error');

    if (action && order) {
      let message = '';
      let success = false;

      if (rc === '00') {
        success = true;
        switch (action) {
          case 'finalizare':
            message = `Tranzacția ${order} a fost finalizată cu succes!`;
            break;
          case 'returnare':
            message = `Returnarea în valoare de ${amount} MDL pentru tranzacția ${order} a fost efectuată cu succes!`;
            break;
          case 'anulare':
            message = `Tranzacția ${order} a fost anulată cu succes!`;
            break;
        }
      } else if (error) {
        message = `Eroare la ${action}: ${error}`;
      } else {
        message = `Eroare la ${action}. Cod RC: ${rc}`;
      }

      setActionStatus({
        type: action,
        success,
        message
      });

      // Curățăm parametrii din URL după ce am afișat mesajul
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);


  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setAuthorized(true);
    }
  }, []);

  if (!authorized) return <p>Verificare autentificare...</p>;

  return (
    <Page title="Tranzacții" fullWidth>
      <Layout>
        <Layout.Section>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="w-48">
                  <Select
                    label="Metodă de plată"
                    options={paymentMethodOptions}
                    value={selectedPaymentMethod}
                    onChange={setSelectedPaymentMethod}
                  />
                </div>
                <div className="w-80">
                  <BlockStack>
                    <Text as="span" variant="bodyMd" fontWeight="medium">
                      Perioada
                    </Text>
                    <Popover
                      active={isDatePickerOpen}
                      activator={
                        <Button
                          onClick={toggleDatePicker}
                          fullWidth
                          textAlign="left"
                        >
                          {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
                        </Button>
                      }
                      onClose={handleDatePickerClose}
                      sectioned={false}
                      fullHeight
                      preferredAlignment="right"
                    >
                      <BlockStack>
                        <Box padding="400">
                          <DatePicker
                            month={dateRange.start.getMonth()}
                            year={dateRange.start.getFullYear()}
                            selected={dateRange}
                            onChange={setDateRange}
                            disableDatesBefore={new Date(2024, 0, 1)}
                            disableDatesAfter={new Date(2024, 11, 31)}
                            allowRange
                            multiMonth
                          />
                        </Box>
                        <Box padding="400" borderWidth="025" borderColor="border">
                          <InlineStack align="end">
                            <ButtonGroup>
                              <Button onClick={handleDatePickerClose}>Închide</Button>
                            </ButtonGroup>
                          </InlineStack>
                        </Box>
                      </BlockStack>
                    </Popover>
                  </BlockStack>
                </div>
              </div>

              <div className="w-80 mb-6">
                <TextField
                  label="Căutare"
                  value={searchTerm}
                  onChange={setSearchTerm}
                  autoComplete="off"
                  placeholder="Căutați după ID, sumă sau detalii..."
                />
              </div>
            </div>
          </Card>

          <div className="mt-4">
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <Text as="h2" variant="headingMd" fontWeight="medium">
                    Mediul de tranzacții
                  </Text>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="production"
                        name="environment"
                        checked={environment === "production"}
                        onChange={() => setEnvironment("production")}
                        className="h-4 w-4"
                      />
                      <label htmlFor="production" className="text-sm font-medium">
                        Mediul de producție
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="test"
                        name="environment"
                        checked={environment === "test"}
                        onChange={() => setEnvironment("test")}
                        className="h-4 w-4"
                      />
                      <label htmlFor="test" className="text-sm font-medium">
                        Mediul de test
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-4">
            <Card>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <div className="min-w-[1400px]">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <Text as="p" variant="bodyMd">Se încarcă...</Text>
                      </div>
                    ) : selectedPaymentMethod === "visa-mastercard" ? (
                      <DataTable
                        columnContentTypes={[
                          "text",  // Status
                          "text",  // Terminal
                          "text",  // TRTYPE
                          "text",  // ORDER
                          "text",  // Sumă
                          "text",  // Valută
                          "text",  // Action
                          "text",  // RC
                          "text",  // Approval
                          "text",  // RRN
                          "text",  // INT REF
                          "text",  // Timestamp
                          "text",  // Nonce
                          "text",  // Semnătură
                          "text",  // ECI
                          "text",  // Mesaj
                          "text",  // Acțiuni
                        ]}
                        headings={tableHeaders}
                        rows={transactions}
                        hoverable
                        defaultSortDirection="descending"
                        initialSortColumnIndex={11}
                        truncate
                      />
                    ) : (
                      <DataTable
                        columnContentTypes={[
                          "text",  // MIA ID
                          "text",  // Data
                          "text",  // Ora
                          "text",  // Nume Plătitor
                          "text",  // Sumă
                          "text",  // Tip plată
                          "text",  // Mesaj
                          "text"   // Acțiuni
                        ]}
                        headings={[
                          "MIA ID",
                          "Data",
                          "Ora",
                          "Nume Plătitor",
                          "Sumă",
                          "Tip plată",
                          "Mesaj",
                          "Acțiuni"
                        ]}
                        rows={transactions}
                        hoverable
                        defaultSortDirection="descending"
                        initialSortColumnIndex={1}
                      />
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Layout.Section>
      </Layout>

      <Modal
        open={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Detalii Tranzacție"
        primaryAction={{
          content: 'Închide',
          onAction: () => setIsDetailsModalOpen(false),
        }}
        secondaryActions={[
          {
            content: 'Finalizare',
            onAction: () => handleAction('finalizare'),
          },
          {
            content: 'Anulare',
            onAction: () => handleAction('anulare'),
          },
          {
            content: 'Returnare',
            onAction: () => handleAction('returnare'),
          },
        ]}
      >
        <Modal.Section>
          {actionStatus && (
            <Banner
              tone={actionStatus.success ? "success" : "critical"}
              onDismiss={() => setActionStatus(null)}
            >
              {actionStatus.message}
            </Banner>
          )}
          <BlockStack gap="400">
            <Box padding="400" background="bg-surface-secondary">
              <BlockStack gap="400">
                {selectedPaymentMethod === "visa-mastercard" ? (
                  <>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        Status:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {(() => {
                          switch (selectedTransaction?.trtype) {
                            case '0':
                              return <Badge tone="success">Success</Badge>;
                            case '21':
                              return <Badge tone="success">Finalizată</Badge>;
                            case '22':
                              return <Badge tone="critical">Anulată</Badge>;
                            case '24':
                              return <Badge tone="info">Returnată</Badge>;
                            default:
                              return <Badge tone="attention">Necunoscut</Badge>;
                          }
                        })()}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        Terminal:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {selectedTransaction?.terminal || '-'}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        TRTYPE:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {selectedTransaction?.trtype || '-'}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        ORDER:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {selectedTransaction?.ORDER || '-'}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        Sumă:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {selectedTransaction?.amount || '0'}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        Valută:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {selectedTransaction?.currency || 'MDL'}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        Action:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {selectedTransaction?.action || '-'}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        RC:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {getRcBadge(selectedTransaction?.rc)}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        Approval:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {selectedTransaction?.approval || '-'}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        RRN:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {selectedTransaction?.rrn || '-'}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        INT REF:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {selectedTransaction?.int_ref || '-'}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        Timestamp:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {selectedTransaction?.formattedTimestamp || '-'}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        Nonce:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {selectedTransaction?.nonce || '-'}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        Semnătură:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {selectedTransaction?.p_sign || '-'}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        ECI:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {selectedTransaction?.eci || '-'}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        Mesaj:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {selectedTransaction?.text || '-'}
                      </Text>
                    </InlineStack>
                  </>
                ) : (
                  <>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        Data:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {(() => {
                          const [year, month, day] = selectedTransaction?.date?.split('-') || [];
                          return `${day}.${month}.${year} ${selectedTransaction?.time || ''}`;
                        })()}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        Plătitor:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {selectedTransaction?.payerName} ({selectedTransaction?.payerIdnp})
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        Beneficiar IDNP:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {selectedTransaction?.beneficiaryIdnp}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        Tip tranzacție:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {selectedTransaction?.transactionType}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        Sumă:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {selectedTransaction?.transactionAmount}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        Status:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {selectedTransaction?.transactionStatus}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        Banca destinație:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {selectedTransaction?.destinationBankName}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        Mesaj:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {selectedTransaction?.transactionMessage}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        Tip plată:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {selectedTransaction?.paymentType}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd" fontWeight="medium">
                        MIA ID:
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {selectedTransaction?.miaId}
                      </Text>
                    </InlineStack>
                  </>
                )}
              </BlockStack>
            </Box>
          </BlockStack>
        </Modal.Section>
      </Modal>

      <Modal
        open={isReturnModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsReturnModalOpen(false);
          setReturnAmount("");
          setReturnComment("");
          setReturnError("");
        }}
        title="Returnare tranzacție"
        primaryAction={{
          content: 'Confirmă returnarea',
          onAction: handleReturnSubmit,
        }}
        secondaryActions={[
          {
            content: 'Anulează',
            onAction: () => {
              setIsModalOpen(false);
              setIsReturnModalOpen(false);
              setReturnAmount("");
              setReturnComment("");
              setReturnError("");
            },
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <BlockStack>
              <Text as="p" variant="bodyMd">
                Suma maximă care poate fi returnată: {selectedTransaction?.amount} {selectedTransaction?.currency}
              </Text>
            </BlockStack>
            <TextField
              label="Sumă de returnat"
              type="number"
              value={returnAmount}
              onChange={setReturnAmount}
              autoComplete="off"
              placeholder="0.00"
              suffix={selectedTransaction?.currency}
            />
            <TextField
              label="Comentariu"
              value={returnComment}
              onChange={setReturnComment}
              multiline={3}
              autoComplete="off"
              placeholder="Introduceți motivul returnării"
            />
            {returnError && (
              <Banner tone="critical">
                {returnError}
              </Banner>
            )}
          </BlockStack>
        </Modal.Section>
      </Modal>

      <Modal
        open={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setCustomerEmail("");
          setEmailError("");
        }}
        title="Introduceți email-ul clientului"
        primaryAction={{
          content: 'Confirmă și trimite',
          onAction: handleEmailSubmit,
        }}
        secondaryActions={[
          {
            content: 'Anulează',
            onAction: () => {
              setIsEmailModalOpen(false);
              setCustomerEmail("");
              setEmailError("");
            },
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <BlockStack>
              <Text as="p" variant="bodyMd">
                Vă rugăm să introduceți email-ul clientului pentru a putea trimite confirmarea tranzacției.
              </Text>
            </BlockStack>
            <TextField
              label="Email client"
              type="email"
              value={customerEmail}
              onChange={setCustomerEmail}
              autoComplete="email"
              placeholder="client@example.com"
              error={emailError}
            />
            <BlockStack>
              <Text as="p" variant="bodyMd">
                După confirmare, veți fi redirecționat către pagina de plată pentru a finaliza tranzacția.
              </Text>
            </BlockStack>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
} 