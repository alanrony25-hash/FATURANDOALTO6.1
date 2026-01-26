
import { GoogleGenAI } from "@google/genai";
import { Journey } from "../types";

export const getJourneyInsight = async (journey: Journey): Promise<string> => {
  try {
    // Initializing Gemini API client with named parameter apiKey as per @google/genai guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const gross = journey.rides.reduce((acc, r) => acc + r.value, 0);
    const expenses = journey.expenses.reduce((acc, e) => acc + e.value, 0);
    const net = gross - expenses;
    const durationHours = journey.endTime ? (journey.endTime - journey.startTime) / (1000 * 60 * 60) : 1;
    const kmTotal = Math.max(0, (journey.endKm || 0) - journey.startKm);

    // Detalhamento por plataforma para a IA
    const platforms = journey.rides.reduce((acc: any, r) => {
      acc[r.platform] = (acc[r.platform] || 0) + r.value;
      return acc;
    }, {});

    // Fix: Accessed '99' property via bracket notation since numeric identifiers are invalid in dot notation.
    // This resolves the "Cannot find name 'R$'" and other parsing errors caused by broken template string.
    const prompt = `
      Atue como um estrategista de elite para motoristas multiapp (Uber, 99, InDrive e Corridas Particulares).
      Analise esta jornada e forneça um insight tático curto (máx 2 linhas) e uma recomendação.
      
      Métricas da Missão:
      - Faturamento Total Bruto: R$ ${gross.toFixed(2)}
      - Detalhe: Uber: R$ ${platforms.Uber || 0}, 99: R$ ${platforms['99'] || 0}, InDrive: R$ ${platforms.InDrive || 0}, Particular: R$ ${platforms.Particular || 0}
      - Despesas: R$ ${expenses.toFixed(2)}
      - Lucro Líquido: R$ ${net.toFixed(0)}
      - Km Rodados: ${kmTotal}km
      - Eficiência: R$ ${(net / Math.max(durationHours, 0.1)).toFixed(2)}/h
      
      Responda 100% em Português do Brasil. Use emojis de cockpit e seja direto. Fale sobre a diversificação de apps se um se destacar muito.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é o CORE do FaturandoAltoPro, uma inteligência artificial de alta performance. Seu objetivo é maximizar o lucro por KM do piloto. Tom: técnico, motivador e estratégico."
      }
    });

    // Extract text output using the .text property (not a method) as per SDK rules
    return response.text || "Missão concluída. Analise os canais de ganho para otimizar amanhã.";
  } catch (error) {
    console.error("Erro na Telemetria IA:", error);
    return "Analizando dados de voo... Mantenha o foco na rota.";
  }
};
