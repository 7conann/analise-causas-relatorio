"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Download, Printer, Copy, Eye, EyeOff, Maximize, Minimize } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface WebhookResponse {
  success: boolean
  status: number
  data: any
  contentType: string
  method: string
}

const possibleKeys = ["rca_last_response", "beely_last_response", "last_webhook_response"]

export default function OutputPage() {
  const { toast } = useToast()
  const router = useRouter()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [response, setResponse] = useState<WebhookResponse | null>(null)
  const [showJson, setShowJson] = useState(false)
  const [htmlContent, setHtmlContent] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const loadResponse = () => {
      let stored: string | null = null

      for (const key of possibleKeys) {
        stored = localStorage.getItem(key)
        if (stored) break
      }

      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setResponse(parsed)

          if (parsed.success && parsed.data?.html) {
            const enhancedHtml = `
              <html>
                <head>
                  <meta charset="utf-8" />
                  <title>Relatório de Análise RCA</title>
                  <style>
                    * { box-sizing: border-box; }
                    body {
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                      margin: 0;
                      padding: 24px;
                      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                      color: #f1f5f9;
                      line-height: 1.6;
                    }
                    .container {
                      max-width: 1200px;
                      margin: 0 auto;
                      background: #1e293b;
                      border-radius: 16px;
                      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                      overflow: hidden;
                      border: 1px solid #334155;
                    }
                    .header {
                      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
                      color: white;
                      padding: 32px;
                      text-align: center;
                    }
                    .header h1 {
                      margin: 0;
                      font-size: 2.5rem;
                      font-weight: 700;
                      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    }
                    .content { padding: 32px; }
                    h2 {
                      color: #60a5fa;
                      margin: 32px 0 20px 0;
                      font-size: 1.75rem;
                      font-weight: 600;
                      border-bottom: 3px solid #475569;
                      padding-bottom: 12px;
                    }
                    h3 {
                      color: #e2e8f0;
                      font-size: 1.25rem;
                      font-weight: 600;
                      margin: 20px 0 12px 0;
                    }
                    .card {
                      background: linear-gradient(135deg, #334155 0%, #475569 100%);
                      border: 1px solid #64748b;
                      border-radius: 12px;
                      padding: 24px;
                      margin: 20px 0;
                      box-shadow: 0 4px 6px rgba(0,0,0,0.2);
                      transition: transform 0.2s ease, box-shadow 0.2s ease;
                    }
                    .card:hover {
                      transform: translateY(-2px);
                      box-shadow: 0 8px 15px rgba(0,0,0,0.3);
                    }
                    .subcard {
                      background: #1e293b;
                      border: 2px dashed #64748b;
                      padding: 20px;
                      margin: 16px 0;
                      border-radius: 8px;
                      position: relative;
                    }
                    .subcard::before {
                      content: '';
                      position: absolute;
                      top: -1px;
                      left: -1px;
                      right: -1px;
                      bottom: -1px;
                      background: linear-gradient(45deg, #3b82f6, #8b5cf6);
                      border-radius: 8px;
                      z-index: -1;
                      opacity: 0;
                      transition: opacity 0.3s ease;
                    }
                    .subcard:hover::before { opacity: 0.2; }
                    .avisos {
                      background: linear-gradient(135deg, #451a03 0%, #78350f 100%);
                      border: 2px solid #f59e0b;
                      color: #fbbf24;
                    }
                    .avisos h3 { color: #fbbf24; display: flex; align-items: center; gap: 8px; }
                    .avisos h3::before { content: '⚠️'; font-size: 1.2em; }
                    ul { margin: 12px 0; padding-left: 24px; }
                    li { margin: 8px 0; padding: 4px 0; }
                    .subcard div { margin: 8px 0; padding: 4px 0; }
                    .subcard b {
                      color: #60a5fa;
                      font-weight: 600;
                      display: inline-block;
                      min-width: 140px;
                    }
                    .causa-badge {
                      display: inline-block;
                      background: #3b82f6;
                      color: white;
                      padding: 4px 12px;
                      border-radius: 20px;
                      font-size: 0.875rem;
                      font-weight: 500;
                      margin-bottom: 12px;
                    }
                    .task-type {
                      display: inline-block;
                      padding: 2px 8px;
                      border-radius: 12px;
                      font-size: 0.75rem;
                      font-weight: 500;
                      text-transform: uppercase;
                      margin-left: 8px;
                    }
                    .task-type.inspecao { background: #1e40af; color: #dbeafe; }
                    .task-type.documento { background: #166534; color: #dcfce7; }
                    .task-type.medicao { background: #92400e; color: #fef3c7; }
                    @media (max-width: 768px) {
                      body { padding: 12px; }
                      .header { padding: 20px; }
                      .header h1 { font-size: 2rem; }
                      .content { padding: 20px; }
                      .card { padding: 16px; }
                      .subcard { padding: 16px; }
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>Relatório A3 – Análise de Falha</h1>
                    </div>
                    <div class="content">
                      ${parsed.data.html
                        .replace(/<body[^>]*>(.*)<\/body>/s, "$1")
                        .replace(/<html[^>]*>|<\/html>|<head[^>]*>.*?<\/head>/gs, "")}
                    </div>
                  </div>
                  <script>
                    document.querySelectorAll('.subcard').forEach(card => {
                      const tipoDiv = Array.from(card.querySelectorAll('div')).find(div =>
                        div.innerHTML.includes('<b>Tipo:</b>')
                      );
                      if (tipoDiv) {
                        const tipo = tipoDiv.textContent.split(':')[1]?.trim();
                        if (tipo) {
                          const badge = document.createElement('span');
                          badge.className = 'task-type ' + tipo;
                          badge.textContent = tipo;
                          tipoDiv.appendChild(badge);
                        }
                      }
                    });
                    document.querySelectorAll('.card h3').forEach(h3 => {
                      if (h3.textContent.includes('Causa')) {
                        const badge = document.createElement('div');
                        badge.className = 'causa-badge';
                        badge.textContent = h3.textContent;
                        h3.parentNode.insertBefore(badge, h3);
                        h3.style.display = 'none';
                      }
                    });
                  </script>
                </body>
              </html>
            `
            setHtmlContent(enhancedHtml)
          } else if (parsed.success && parsed.contentType?.includes("text/html") && typeof parsed.data === "string") {
            setHtmlContent(parsed.data)
          } else {
            // sem HTML
          }
        } catch {
          // ignore
        }
      }
    }

    const pollForData = () => {
      const interval = setInterval(() => {
        loadResponse()
        if (response) clearInterval(interval)
      }, 1000)
      setTimeout(() => clearInterval(interval), 30000)
      return interval
    }

    loadResponse()
    const pollingInterval = pollForData()

    const handleWebhookComplete = (event: CustomEvent) => {
      const { success, status } = event.detail
      if (success) {
        toast({ title: "✅ Análise Concluída!", description: "Relatório gerado com sucesso.", duration: 3000 })
        setTimeout(loadResponse, 500)
      } else {
        toast({
          title: "❌ Erro na Análise",
          description: `Falha ao gerar o relatório (Status: ${status})`,
          variant: "destructive",
          duration: 5000,
        })
      }
    }

    window.addEventListener("webhook-complete", handleWebhookComplete as EventListener)

    const handleStorageChange = (e: StorageEvent) => {
      if (possibleKeys.includes(e.key || "")) loadResponse()
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      clearInterval(pollingInterval)
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("webhook-complete", handleWebhookComplete as EventListener)
    }
  }, [toast, router, response])

  const toggleFullscreen = () => setIsFullscreen((v) => !v)

  const handleDownloadHtml = () => {
    if (!htmlContent) {
      toast({ title: "Nenhum HTML disponível", description: "Não há conteúdo para download.", variant: "destructive" })
      return
    }
    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `relatorio-rca-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.html`
    link.click()
    URL.revokeObjectURL(url)
    toast({ title: "HTML baixado", description: "Arquivo salvo com sucesso." })
  }

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.print()
      } catch {
        toast({ title: "Erro ao imprimir", description: "Não foi possível imprimir.", variant: "destructive" })
      }
    } else {
      toast({
        title: "Nenhum conteúdo para imprimir",
        description: "Não há conteúdo carregado no preview.",
        variant: "destructive",
      })
    }
  }

  const handleCopyJson = async () => {
    if (!response?.data) {
      toast({ title: "Nenhum JSON disponível", description: "Nada para copiar.", variant: "destructive" })
      return
    }
    try {
      const jsonString = JSON.stringify(response.data, null, 2)
      await navigator.clipboard.writeText(jsonString)
      toast({ title: "JSON copiado", description: "Dados copiados para a área de transferência." })
    } catch {
      toast({ title: "Erro ao copiar", description: "Não foi possível copiar.", variant: "destructive" })
    }
  }

  const getStatusBadgeVariant = (status: number) => {
    if (status >= 200 && status < 300) return "default"
    if (status >= 400) return "destructive"
    return "secondary"
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 border-b w-full">
          <h2 className="text-lg font-semibold">Relatório de Análise - Tela Cheia</h2>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={handleDownloadHtml} disabled={!htmlContent} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={!htmlContent} className="w-full sm:w-auto">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" size="sm" onClick={toggleFullscreen} className="w-full sm:w-auto">
              <Minimize className="h-4 w-4 mr-2" />
              Sair da Tela Cheia
            </Button>
          </div>
        </div>
        <div className="h-[calc(100vh-73px)]">
          {htmlContent ? (
            <iframe
              ref={iframeRef}
              name="previewIframe"
              srcDoc={htmlContent}
              className="block w-full h-full bg-slate-900"
              title="Webhook Response Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Nenhum conteúdo disponível para preview</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">📊 Visualização do Relatório</h1>
          <p className="text-muted-foreground">Visualize e gerencie o relatório de análise gerado</p>
        </div>

        {response && (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={getStatusBadgeVariant(response.status)}>{response.status}</Badge>
            <Badge variant="outline">{response.method.toUpperCase()}</Badge>
          </div>
        )}
      </div>

      {!response ? (
        <Card className="w-full max-w-full overflow-hidden">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">Nenhuma resposta disponível</p>
              <p className="text-sm text-muted-foreground">Execute uma análise na aba Execução para ver os resultados aqui</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {/* Ações */}
          <Card className="w-full max-w-full overflow-hidden">
            <CardHeader>
              <CardTitle>🛠️ Ações</CardTitle>
              <CardDescription>Gerencie a saída do relatório</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full">
                <Button variant="outline" onClick={handleDownloadHtml} disabled={!htmlContent} className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar HTML
                </Button>
                <Button variant="outline" onClick={handlePrint} disabled={!htmlContent} className="w-full sm:w-auto">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                <Button variant="outline" onClick={toggleFullscreen} disabled={!htmlContent} className="w-full sm:w-auto">
                  <Maximize className="h-4 w-4 mr-2" />
                  Tela Cheia
                </Button>
                {response.data && typeof response.data === "object" && (
                  <Button variant="ghost" size="sm" onClick={() => setShowJson(!showJson)} className="w-full sm:w-auto">
                    {showJson ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showJson ? "Ocultar" : "Ver"} Dados Técnicos
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* JSON técnico */}
          {showJson && response.data && (
            <Card className="w-full max-w-full overflow-hidden border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Dados Técnicos (JSON)</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleCopyJson}>
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="w-full overflow-x-auto">
                  <pre className="bg-muted/50 p-3 rounded-md text-xs max-h-48 whitespace-pre-wrap break-words break-all font-mono">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview */}
          <Card className="w-full max-w-full overflow-hidden">
            <CardHeader>
              <CardTitle>📋 Relatório de Análise</CardTitle>
              <CardDescription>
                Visualização do relatório gerado
                {response.contentType && ` (${response.contentType})`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {htmlContent ? (
                <div className="border border-border rounded-md overflow-hidden w-full max-w-full">
                  <div className="w-full overflow-x-auto">
                    <iframe
                      ref={iframeRef}
                      name="previewIframe"
                      srcDoc={htmlContent}
                      className="block w-full min-h-[360px] sm:h-[700px] bg-slate-900"
                      title="Webhook Response Preview"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    Nenhum conteúdo disponível para preview.
                    {response && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Debug: Success={response.success ? "true" : "false"}, HasData={response.data ? "true" : "false"}, ContentType={response.contentType || "none"}
                        {response.data && typeof response.data === "object" && <div>HasHTML={response.data.html ? "true" : "false"}</div>}
                      </div>
                    )}
                    {response?.method === "form" && " O resultado será exibido aqui quando recebido."}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="w-full max-w-full overflow-hidden border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">📈 Status da Execução</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={getStatusBadgeVariant(response?.status ?? 0)} className="text-xs">
                    {response?.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Método:</span>
                  <Badge variant="outline" className="text-xs">
                    {response?.method?.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Resultado:</span>
                  <span className={response?.success ? "text-green-500" : "text-red-500"}>
                    {response?.success ? "✅ Sucesso" : "❌ Erro"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
