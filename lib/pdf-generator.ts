import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { WeightLog } from './types';

interface PDFReportData {
  userName: string;
  userEmail: string;
  currentWeight: number;
  initialWeight: number;
  goalWeight: number;
  weightLost: number;
  journeyDays: number;
  totalLogs: number;
  totalApplications: number;
  medications: Array<{
    name: string;
    dosage: number;
    frequency: string;
    startDate: string;
  }>;
  weightLogs: WeightLog[];
  achievements: Array<{
    title: string;
    description: string;
    earnedAt: string;
  }>;
}

export async function generatePDFReport(data: PDFReportData): Promise<void> {
  try {
    const html = createHTMLReport(data);
    
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    console.log('PDF generated at:', uri);

    // Compartilhar o PDF
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartilhar Relatório Médico',
        UTI: 'com.adobe.pdf',
      });
    } else {
      throw new Error('Sharing não está disponível neste dispositivo');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

function createHTMLReport(data: PDFReportData): string {
  const {
    userName,
    userEmail,
    currentWeight,
    initialWeight,
    goalWeight,
    weightLost,
    journeyDays,
    totalLogs,
    medications,
    weightLogs,
    achievements,
  } = data;

  const progressPercentage = ((weightLost / (initialWeight - goalWeight)) * 100).toFixed(0);
  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Médico - Mounjaro Tracker</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #1a1a1a;
      padding: 40px;
      background: #ffffff;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #00d4ff;
    }
    
    .header h1 {
      font-size: 28px;
      color: #1a1a1a;
      margin-bottom: 8px;
    }
    
    .header p {
      font-size: 14px;
      color: #666;
    }
    
    .patient-info {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    
    .patient-info h2 {
      font-size: 18px;
      margin-bottom: 15px;
      color: #1a1a1a;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .info-label {
      font-weight: 600;
      color: #555;
    }
    
    .info-value {
      color: #1a1a1a;
    }
    
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 20px;
      margin-bottom: 15px;
      color: #1a1a1a;
      border-left: 4px solid #00d4ff;
      padding-left: 12px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .stat-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #00d4ff;
      display: block;
      margin-bottom: 5px;
    }
    
    .stat-label {
      font-size: 12px;
      color: #666;
    }
    
    .progress-bar-container {
      background: #e0e0e0;
      height: 30px;
      border-radius: 15px;
      overflow: hidden;
      margin-bottom: 10px;
      position: relative;
    }
    
    .progress-bar {
      background: linear-gradient(90deg, #00d4ff 0%, #00a8cc 100%);
      height: 100%;
      border-radius: 15px;
      transition: width 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .progress-text {
      position: absolute;
      width: 100%;
      text-align: center;
      line-height: 30px;
      font-weight: bold;
      color: #1a1a1a;
    }
    
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    
    .table th,
    .table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #555;
    }
    
    .table tbody tr:hover {
      background: #f8f9fa;
    }
    
    .weight-change {
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
    }
    
    .weight-down {
      color: #10b981;
      background: #d1fae5;
    }
    
    .weight-up {
      color: #ef4444;
      background: #fee2e2;
    }
    
    .medication-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 10px;
      border-left: 4px solid #00d4ff;
    }
    
    .medication-name {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .achievement-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    
    .achievement-card {
      background: #fff3cd;
      padding: 12px;
      border-radius: 8px;
      border-left: 4px solid #ffc107;
    }
    
    .achievement-title {
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 11px;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Relatório Médico</h1>
    <p>Mounjaro Tracker - Acompanhamento de Peso e Medicação</p>
    <p style="margin-top: 10px;">Gerado em: ${today}</p>
  </div>

  <div class="patient-info">
    <h2>Informações do Paciente</h2>
    <div class="info-row">
      <span class="info-label">Nome:</span>
      <span class="info-value">${userName}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Email:</span>
      <span class="info-value">${userEmail}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Início do tratamento:</span>
      <span class="info-value">${weightLogs.length > 0 ? new Date(weightLogs[weightLogs.length - 1].date).toLocaleDateString('pt-BR') : 'N/A'}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Dias de acompanhamento:</span>
      <span class="info-value">${journeyDays} dias</span>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">📈 Resumo do Progresso</h2>
    
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-value">${initialWeight}kg</span>
        <span class="stat-label">Peso Inicial</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${currentWeight}kg</span>
        <span class="stat-label">Peso Atual</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${goalWeight}kg</span>
        <span class="stat-label">Meta</span>
      </div>
    </div>
    
    <div class="progress-bar-container">
      <div class="progress-bar" style="width: ${progressPercentage}%"></div>
      <div class="progress-text">${weightLost.toFixed(1)}kg perdidos (${progressPercentage}% da meta)</div>
    </div>
    
    <p style="text-align: center; color: #666; margin-top: 10px;">
      Faltam ${(initialWeight - goalWeight - weightLost).toFixed(1)}kg para atingir a meta
    </p>
  </div>

  <div class="section">
    <h2 class="section-title">💊 Medicações Ativas</h2>
    ${medications.length > 0 ? medications.map(med => `
      <div class="medication-card">
        <div class="medication-name">${med.name}</div>
        <div>Dosagem: ${med.dosage}mg</div>
        <div>Frequência: ${med.frequency === 'weekly' ? 'Semanal' : 'Diária'}</div>
        <div>Início: ${new Date(med.startDate).toLocaleDateString('pt-BR')}</div>
      </div>
    `).join('') : '<p>Nenhuma medicação cadastrada.</p>'}
  </div>

  <div class="section">
    <h2 class="section-title">⚖️ Histórico de Peso (Últimos 10 registros)</h2>
    <table class="table">
      <thead>
        <tr>
          <th>Data</th>
          <th>Peso</th>
          <th>Variação</th>
          <th>Observações</th>
        </tr>
      </thead>
      <tbody>
        ${weightLogs.slice(0, 10).map((log, index) => {
          const previousLog = index < weightLogs.length - 1 ? weightLogs[index + 1] : null;
          const diff = previousLog ? log.weight - previousLog.weight : 0;
          return `
            <tr>
              <td>${new Date(log.date).toLocaleDateString('pt-BR')}</td>
              <td>${log.weight}kg</td>
              <td>
                ${diff !== 0 ? `
                  <span class="weight-change ${diff < 0 ? 'weight-down' : 'weight-up'}">
                    ${diff < 0 ? '↓' : '↑'} ${Math.abs(diff).toFixed(1)}kg
                  </span>
                ` : '-'}
              </td>
              <td>${log.notes || '-'}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  </div>

  ${achievements.length > 0 ? `
    <div class="section">
      <h2 class="section-title">🏆 Conquistas Alcançadas</h2>
      <div class="achievement-grid">
        ${achievements.map(ach => `
          <div class="achievement-card">
            <div class="achievement-title">${ach.title}</div>
            <div style="font-size: 11px; color: #666;">${ach.description}</div>
            <div style="font-size: 10px; color: #999; margin-top: 4px;">
              ${new Date(ach.earnedAt).toLocaleDateString('pt-BR')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : ''}

  <div class="footer">
    <p>Este relatório foi gerado automaticamente pelo aplicativo Mounjaro Tracker.</p>
    <p>Para mais informações, consulte seu médico.</p>
  </div>
</body>
</html>
  `;
}


