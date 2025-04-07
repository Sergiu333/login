"use client";

import { useState, useEffect } from "react";
import {
  Page,
  Layout,
  Card,
  TextField,
  Checkbox,
  Button,
  FormLayout,
  Text,
  RadioButton,
  Banner,
} from "@shopify/polaris";
import {useRouter} from "next/navigation";

export default function MiaSettingsPage() {
  const [form, setForm] = useState({
    enabled: false,
    testMode: false,
    debugMode: false,
    methodTitle: "MIA",
    methodDescription: "Plată prin MIA",
    logoUrl: "",
    username: "",
    password: "",
  });

  const [status, setStatus] = useState<null | { success: boolean; message: string }>(null);
  const [loading, setLoading] = useState(true);

  const merchantId = "498000049809001"; // ✅ Înlocuiește cu metoda ta din sesiune/login/etc.

  const handleChange = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ✅ Încarcă setările existente din backend
  const loadSettings = async () => {
    try {
      const res = await fetch("https://api.ecompay.md/api/settings/mia", {
        method: "GET",
        headers: {
          "x-merchant-id": merchantId,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la încărcare");

      setForm({
        enabled: data.active ?? false,
        testMode: data.mode === "test",
        debugMode: data.mode === "debug",
        methodTitle: data.qr_button_label ?? "MIA",
        methodDescription: "", // Nu există încă în backend
        logoUrl: "", // Nu este salvat, dar păstrăm pentru UI
        username: data.mia_username ?? "",
        password: data.mia_password ?? "",
      });
    } catch (err: any) {
      console.error("Eroare la încărcare:", err);
      setStatus({ success: false, message: err.message || "Eroare necunoscută" });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Salvează setările în backend
  const handleSave = async () => {
    try {
      const res = await fetch("https://api.ecompay.md/api/settings/mia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-merchant-id": merchantId,
        },
        body: JSON.stringify({
          active: form.enabled,
          mode: form.testMode ? "test" : form.debugMode ? "debug" : "live",
          mia_username: form.username,
          mia_password: form.password,
          qr_button_label: form.methodTitle,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la salvare");

      setStatus({ success: true, message: "Setările au fost salvate cu succes!" });
    } catch (err: any) {
      console.error("Eroare:", err);
      setStatus({ success: false, message: err.message || "Eroare necunoscută" });
    }
  };

  useEffect(() => {
    loadSettings();
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
    <Page title="MIA">
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
                  helpText="Activează sau dezactivează metoda de plată"
                />
                <TextField
                  label="Titlu"
                  value={form.methodTitle}
                  onChange={(v) => handleChange("methodTitle", v)}
                  autoComplete="off"
                  helpText="Titlul metodei de plată afișat clientului"
                />
                <TextField
                  label="Descriere"
                  value={form.methodDescription}
                  onChange={(v) => handleChange("methodDescription", v)}
                  autoComplete="off"
                  helpText="Descrierea metodei de plată afișată clientului"
                />
                <TextField
                  label="Logo"
                  value={form.logoUrl}
                  onChange={(v) => handleChange("logoUrl", v)}
                  autoComplete="off"
                  helpText="URL către sigla metodei de plată (doar pentru UI)"
                />
                <div className="space-y-6">
                  <div className="space-y-8">
                    <Text as="p" variant="bodyMd">Mod de operare:</Text>
                    <RadioButton
                      label="Mod testare"
                      checked={form.testMode}
                      onChange={() =>
                        setForm((prev) => ({
                          ...prev,
                          testMode: true,
                          debugMode: false,
                        }))
                      }
                    />
                    <RadioButton
                      label="Mod depanare"
                      checked={form.debugMode}
                      onChange={() =>
                        setForm((prev) => ({
                          ...prev,
                          debugMode: true,
                          testMode: false,
                        }))
                      }
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
              <h2 className="text-xl font-semibold mb-4">Credențiale MIA</h2>
              <FormLayout>
                <TextField
                  label="Username"
                  value={form.username}
                  onChange={(v) => handleChange("username", v)}
                  autoComplete="off"
                  helpText="Username pentru autentificare MIA"
                />
                <TextField
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={(v) => handleChange("password", v)}
                  autoComplete="off"
                  helpText="Parolă pentru autentificare MIA"
                />
              </FormLayout>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleSave} loading={loading}>
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
