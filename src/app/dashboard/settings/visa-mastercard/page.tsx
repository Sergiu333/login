"use client";

import { useEffect, useState, ChangeEvent } from "react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  RadioButton,
  Text,
  Banner,
  Checkbox,
  BlockStack,
} from "@shopify/polaris";
import {useRouter} from "next/navigation";

export default function VisaMastercardSettingsPage() {
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
    callbackUrl: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<null | { success: boolean; message: string }>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("https://api.ecompay.md/api/settings/visa", {
          headers: { "x-merchant-id": "12345" },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Eroare la încărcare");

        setForm({
          enabled: data.active ?? false,
          testMode: data.test_mode ?? false,
          debugMode: data.debug_mode ?? false,
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
          callbackUrl: data.callback_url ?? "",
        });
      } catch (err) {
        console.error("Eroare la încărcare:", err);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleFileUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    field: "publicKey" | "bankPublicKey" | "privateKey"
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
      const res = await fetch("https://api.ecompay.md/api/settings/visa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-merchant-id": "12345",
        },
        body: JSON.stringify({
          active: form.enabled,
          test_mode: form.testMode,
          debug_mode: form.debugMode,
          title: "Plată cu cardul",
          description: "Achită online cu cardul bancar",
          merchant_id_text: form.merchantId,
          terminal_id: form.terminalId,
          merchant_name: form.merchantName,
          merchant_url: form.merchantUrl,
          merchant_address: form.merchantAddress,
          public_key: form.publicKey,
          bank_public_key: form.bankPublicKey,
          private_key: form.privateKey,
          private_key_password: form.privateKeyPass,
          encryption_method: form.cryptoMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la salvare");

      setForm((prev) => ({ ...prev, callbackUrl: data.callback_url || "" }));
      setStatus({ success: true, message: "Setările au fost salvate cu succes!" });
    } catch (err: any) {
      setStatus({ success: false, message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Page title="Victoriabank Visa/MasterCard">
      <Layout>
        <Layout.Section>
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Setări generale</h2>
              <FormLayout>
                <Checkbox
                  label="Activează această metodă de plată"
                  checked={form.enabled}
                  onChange={(v) => handleChange("enabled", v)}
                />
                <TextField
                  label="Titlu"
                  value="Plată cu cardul"
                  disabled
                  readOnly
                  autoComplete="off"
                />
                <TextField
                  label="Descriere"
                  value="Achită online cu cardul bancar"
                  disabled
                  readOnly
                  autoComplete="off"
                />
                <div className="space-y-8">
                  <Text as="p" variant="bodyMd">Mod de operare:</Text>
                  <RadioButton
                    label="Mod testare"
                    checked={form.testMode}
                    onChange={() => handleChange("testMode", true)}
                  />
                  <RadioButton
                    label="Mod depanare"
                    checked={form.debugMode}
                    onChange={() => handleChange("debugMode", true)}
                  />
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
                  onChange={(v) => handleChange("merchantName", v)}
                  autoComplete="off"
                />
                <TextField 
                  label="URL comerciant" 
                  value={form.merchantUrl} 
                  onChange={(v) => handleChange("merchantUrl", v)}
                  autoComplete="off"
                />
                <TextField 
                  label="Adresă comerciant" 
                  value={form.merchantAddress} 
                  onChange={(v) => handleChange("merchantAddress", v)}
                  autoComplete="off"
                />
                <TextField 
                  label="ID comerciant" 
                  value={form.merchantId} 
                  onChange={(v) => handleChange("merchantId", v)}
                  autoComplete="off"
                />
                <TextField 
                  label="ID terminal" 
                  value={form.terminalId} 
                  onChange={(v) => handleChange("terminalId", v)}
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
                  {["publicKey", "bankPublicKey", "privateKey"].map((key) => (
                    <div key={key}>
                      <Text as="p" variant="bodyMd">
                        {key === "publicKey"
                          ? "Cheie publică comerciant"
                          : key === "bankPublicKey"
                          ? "Cheie publică bancă"
                          : "Cheie privată comerciant"}
                      </Text>
                      <div className="mt-2">
                        <Button
                          onClick={() => document.getElementById(`${key}_upload`)?.click()}
                          variant="secondary"
                        >
                          Importă {key.replace(/([A-Z])/g, " $1")}
                        </Button>
                        <input
                          id={`${key}_upload`}
                          type="file"
                          accept=".pem,.key"
                          style={{ display: "none" }}
                          onChange={(e) => handleFileUpload(e, key as any)}
                        />
                      </div>
                    </div>
                  ))}
                  <TextField
                    label="Parolă cheie privată (opțional)"
                    value={form.privateKeyPass}
                    onChange={(v) => handleChange("privateKeyPass", v)}
                    type="password"
                    autoComplete="off"
                  />
                  <RadioButton
                    label="SHA-256"
                    checked={form.cryptoMethod === "sha256"}
                    onChange={() => handleChange("cryptoMethod", "sha256")}
                  />
                  <RadioButton
                    label="MD5"
                    checked={form.cryptoMethod === "md5"}
                    onChange={() => handleChange("cryptoMethod", "md5")}
                  />
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
                  label="URL pentru callback"
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
          {status && (
            <div className="mt-4">
              <Banner tone={status.success ? "success" : "critical"}>
                {status.message}
              </Banner>
            </div>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
