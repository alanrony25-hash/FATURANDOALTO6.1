
import { GoogleGenAI } from "@google/genai";
import { Journey } from "../types";

export const getJourneyInsight = async (journey: Journey): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const gross = journey.rides.reduce((acc, r) => acc + r.value, 0);
    const expenses = journey.expenses.reduce((acc, e) => acc + e.value, 0);
    const kmTotal = Math.max(0, (journey.endKm || 0) - journey.startKm);
    const durationHours = journey.endTime ? (journey.endTime - journey.startTime) / (1000 * 60 * 60) : 1;
    
    const net = gross - expenses;
    const efficiency = net / Math.max(durationHours, 0.5);

    const prompt = `
      CONTEXTO: Copiloto de IA para Motoristas Profissionais (FaturandoAltoPro).
      DADOS DA MISSÃO:
      - Bruto: R$ ${gross.toFixed(2)}
      - Gastos: R$ ${expenses.toFixed(2)}
      - Lucro Líquido Real: R$ ${net.toFixed(2)}
      - Distância: ${kmTotal}km
      - Eficiência: R$ ${efficiency.toFixed(2)}/hora
      
      TAREFA: Gere uma diretriz tática agressiva de 1 a 2 linhas em Português-BR.
      FOCO: Se a eficiência estiver baixa, sugira trocar de app ou zona. Se alta, parabenize pela precisão.
      TOM: Militar, tecnológico, motivador.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é o CORE 6.0, a IA tática do FaturandoAltoPro. Seu objetivo é otimizar o lucro/km. Seja extremamente conciso."
      }
    });

    return response.text || "Dados consolidados. Mantenha o foco no odômetro.";
  } catch (error) {
    console.error("AI Core Error:", error);
    return "Sincronização pendente. Continue operando em modo Stealth.";
  }
};
