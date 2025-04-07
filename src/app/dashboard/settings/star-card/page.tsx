"use client";

import { useEffect, useState, ChangeEvent } from "react";
import {
  Page,
  Layout,
  Card,
  TextField,
  Checkbox,
  Button,
  FormLayout,
  RadioButton,
  Text,
  Banner,
  BlockStack,
} from "@shopify/polaris";
import {useRouter} from "next/navigation";

export default function StarCardSettingsPage() {
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

  const [form, setForm] = useState({
    enabled: false,
    testMode: false,
    debugMode: false,
    methodTitle: "",
    methodDescription: "",
    logoUrl: "",
    orderDescription: "",
    merchantId: "",
    terminalId: "",
    merchantName: "",
    merchantUrl: "",
    merchantAddress: "",
    publicKey: "",
    bankPublicKey: "",
    privateKey: "",
    privateKeyPass: "",
    cryptoMethod: "sha256",
    transactionType: "charge",
    callbackUrl: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("https://api.ecompay.md/api/settings/star", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-merchant-id": "12345",
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Eroare la încărcare");

        setForm({
          enabled: data.active ?? false,
          testMode: data.test_mode ?? false,
          debugMode: data.debug_mode ?? false,
          methodTitle: data.title ?? "Victoriabank Puncte Star",
          methodDescription: data.description ?? "Plată cu puncte Star",
          logoUrl: "", // read-only în backend
          orderDescription: data.order_description ?? "",
          merchantId: data.merchant_id_text ?? "",
          terminalId: data.terminal_id ?? "",
          merchantName: data.merchant_name ?? "",
          merchantUrl: data.merchant_url ?? "",
          merchantAddress: data.merchant_address ?? "",
          publicKey: data.public_key ?? "",
          bankPublicKey: data.bank_public_key ?? "",
          privateKey: data.private_key ?? "",
          privateKeyPass: data.private_key_password ?? "",
          cryptoMethod: data.encryption_method ?? "sha256",
          transactionType: data.transactionType ?? "charge",
          callbackUrl: data.callback_url ?? "",
        });
      } catch (err) {
        console.error("Eroare la încărcarea setărilor STAR:", err);
      }
    };

    fetchSettings();
  }, []);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<null | { success: boolean; message: string }>(null);

  const handleChange = (field: string, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleFileUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    field: "public_key" | "bank_public_key" | "private_key"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".pem") && !file.name.endsWith(".key")) {
      alert("Se acceptă doar fișiere .pem, .key");
      return;
    }

    const text = await file.text();
    handleChange(field, text);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("https://api.ecompay.md/api/settings/star-rate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-merchant-id": "12345",
        },
        body: JSON.stringify({
          active: form.enabled,
          test_mode: form.testMode,
          debug_mode: form.debugMode,
          transactionType: form.transactionType,
          merchant_name: form.merchantName,
          merchant_url: form.merchantUrl,
          merchant_address: form.merchantAddress,
          merchant_id_text: form.merchantId,
          terminal_id: form.terminalId,
          public_key: form.publicKey,
          bank_public_key: form.bankPublicKey,
          private_key: form.privateKey,
          private_key_password: form.privateKeyPass,
          encryption_method: form.cryptoMethod,
          title: "Victoriabank STAR Card Rate",
          description: "Plată în rate cu cardul STAR",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la salvare");

      setForm(prev => ({
        ...prev,
        callbackUrl: data.callback_url || "",
      }));

      setSaveStatus({ success: true, message: "Setările au fost salvate cu succes!" });
    } catch (error: any) {
      setSaveStatus({ success: false, message: error.message || "Eroare la salvare" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Page title="Victoriabank STAR Card Rate">
      <Layout>
        <Layout.Section>
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Setări generale</h2>
              <FormLayout>
              <Checkbox
    label="Activează metoda de plată"
    checked={form.enabled}
                  onChange={(checked) => setForm({ ...form, enabled: checked })}
                />
                <TextField 
                  label="Titlu" 
                  value="Victoriabank STAR Card Rate"
                  disabled 
                  readOnly 
                  autoComplete="off"
                />
                <TextField 
                  label="Descriere" 
                  value="Plată în rate cu cardul STAR"
                  disabled 
                  readOnly 
                  autoComplete="off"
                />

                <div className="space-y-6">
                  <div className="space-y-8">
                    <Text as="p" variant="bodyMd">Mod de operare:</Text>
                    <RadioButton
                      label="Mod testare"
                      checked={form.testMode}
                      onChange={() => setForm({ ...form, testMode: true, debugMode: false })}
                    />
                    <RadioButton
                      label="Mod depanare"
                      checked={form.debugMode}
                      onChange={() => setForm({ ...form, debugMode: true, testMode: false })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Text as="p" variant="bodyMd">Tip tranzacție:</Text>
                    <RadioButton
                      label="Charge"
                      checked={form.transactionType === "charge"}
                      onChange={() => setForm({ ...form, transactionType: "charge" })}
                    />
                    <RadioButton
                      label="Authorization"
                      checked={form.transactionType === "authorization"}
                      onChange={() => setForm({ ...form, transactionType: "authorization" })}
                    />
                  </div>
                </div>
              </FormLayout>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Date comerciant</h2>
              <FormLayout>
                <TextField 
                  label="Nume comerciant" 
                  value={form.merchantName} 
                  onChange={(v) => setForm({ ...form, merchantName: v })}
                  autoComplete="off"
                />
                <TextField 
                  label="URL comerciant" 
                  value={form.merchantUrl} 
                  onChange={(v) => setForm({ ...form, merchantUrl: v })}
                  autoComplete="off"
                />
                <TextField 
                  label="Adresă comerciant" 
                  value={form.merchantAddress} 
                  onChange={(v) => setForm({ ...form, merchantAddress: v })}
                  autoComplete="off"
                />
                <TextField 
                  label="ID comerciant" 
                  value={form.merchantId} 
                  onChange={(v) => setForm({ ...form, merchantId: v })}
                  autoComplete="off"
                />
                <TextField 
                  label="ID terminal" 
                  value={form.terminalId} 
                  onChange={(v) => setForm({ ...form, terminalId: v })}
                  autoComplete="off"
                />
              </FormLayout>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Chei criptografice și semnare</h2>
              <FormLayout>
                <BlockStack gap="400">
                  {["public_key", "bank_public_key", "private_key"].map((key) => (
                    <div key={key}>
                      <Text as="p" variant="bodyMd">{
                        key === "public_key"
                          ? "Cheie publică comerciant"
                          : key === "bank_public_key"
                          ? "Cheie publică bancă"
                          : "Cheie privată comerciant"
                      }</Text>
                      <div className="mt-2">
                        <Button
                          onClick={() => document.getElementById(key + "_upload")?.click()}
                          variant="secondary"
                        >
                          Importă {key.replaceAll("_", " ")}
                        </Button>
                        <input
                          id={key + "_upload"}
                          type="file"
                          accept=".pem"
                          onChange={(e) => handleFileUpload(e, key as any)}
                          style={{ display: "none" }}
                        />
                      </div>
                    </div>
                  ))}
                  <TextField
                    label="Parolă cheie privată (opțional)"
                    value={form.privateKeyPass}
                    onChange={(v) => handleChange("private_key_password", v)}
                    type="password"
                    autoComplete="off"
                  />
                  <div className="space-y-2">
                    <Text as="p" variant="bodyMd">Metodă criptare:</Text>
                    <RadioButton
                      label="SHA-256"
                      checked={form.cryptoMethod === "sha256"}
                      onChange={() => handleChange("encryption_method", "sha256")}
                    />
                    <RadioButton
                      label="MD5"
                      checked={form.cryptoMethod === "md5"}
                      onChange={() => handleChange("encryption_method", "md5")}
                    />
                  </div>
                </BlockStack>
              </FormLayout>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Configurare notificări callback</h2>
              <FormLayout>
                <TextField 
                  label="URL callback" 
                  value={form.callbackUrl} 
                  readOnly 
                  autoComplete="off"
                />
              </FormLayout>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <div className="flex justify-end">
            <Button variant="primary" loading={isSaving} onClick={handleSave}>
              Salvează
            </Button>
          </div>
          {saveStatus && (
            <div className="mt-4">
              <Banner tone={saveStatus.success ? "success" : "critical"}>
                {saveStatus.message}
              </Banner>
            </div>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
