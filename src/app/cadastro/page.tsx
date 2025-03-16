'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Loader, Save, ArrowLeft } from 'lucide-react';

type DecisaoType = 'Aceitar Jesus Cristo como Salvador' | 'Reconciliar-me com Cristo' | 'Ser batizado em águas' | 'Quero um Grupo da Cidade';
type EstadoCivilType = 'Solteiro' | 'Casado' | 'União Estável' | 'Divorciado' | 'Viúvo';
type CelebracaoType = 'Dominical' | 'Eleve' | 'Ignição' | 'Outros';

export default function CadastroDecisao() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    decisao: '' as DecisaoType,
    data_decisao: new Date().toISOString().split('T')[0],
    estado_civil: '' as EstadoCivilType,
    nascimento: '',
    email: '',
    cidade: '',
    estado: '',
    bairro: '',
    celular: '',
    celebracao: '' as CelebracaoType,
    celebracao_extra: ''
  });

  const decisoes: DecisaoType[] = [
    'Aceitar Jesus Cristo como Salvador',
    'Reconciliar-me com Cristo',
    'Ser batizado em águas',
    'Quero um Grupo da Cidade'
  ];

  const estados_civis: EstadoCivilType[] = [
    'Solteiro',
    'Casado',
    'União Estável',
    'Divorciado',
    'Viúvo'
  ];

  const celebracoes: CelebracaoType[] = [
    'Dominical',
    'Eleve',
    'Ignição',
    'Outros'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!user) throw new Error('Usuário não autenticado');

      const { error: supabaseError } = await supabase
        .from('decisoes')
        .insert([
          {
            ...formData,
            user_id: user.id
          }
        ]);

      if (supabaseError) throw supabaseError;

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar decisão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Cadastro de Decisão</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                required
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="decisao" className="block text-sm font-medium text-gray-700 mb-1">
                Decisão *
              </label>
              <select
                required
                id="decisao"
                name="decisao"
                value={formData.decisao}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione uma decisão</option>
                {decisoes.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="data_decisao" className="block text-sm font-medium text-gray-700 mb-1">
                Data da Decisão
              </label>
              <input
                type="date"
                id="data_decisao"
                name="data_decisao"
                value={formData.data_decisao}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="estado_civil" className="block text-sm font-medium text-gray-700 mb-1">
                Estado Civil
              </label>
              <select
                id="estado_civil"
                name="estado_civil"
                value={formData.estado_civil}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione o estado civil</option>
                {estados_civis.map(ec => (
                  <option key={ec} value={ec}>{ec}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="nascimento" className="block text-sm font-medium text-gray-700 mb-1">
                Data de Nascimento
              </label>
              <input
                type="date"
                id="nascimento"
                name="nascimento"
                value={formData.nascimento}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="celular" className="block text-sm font-medium text-gray-700 mb-1">
                Celular / WhatsApp
              </label>
              <input
                type="tel"
                id="celular"
                name="celular"
                value={formData.celular}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">
                Cidade
              </label>
              <input
                type="text"
                id="cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <input
                type="text"
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="bairro" className="block text-sm font-medium text-gray-700 mb-1">
                Bairro
              </label>
              <input
                type="text"
                id="bairro"
                name="bairro"
                value={formData.bairro}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="celebracao" className="block text-sm font-medium text-gray-700 mb-1">
                Celebração
              </label>
              <select
                id="celebracao"
                name="celebracao"
                value={formData.celebracao}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione a celebração</option>
                {celebracoes.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {formData.celebracao === 'Outros' && (
              <div>
                <label htmlFor="celebracao_extra" className="block text-sm font-medium text-gray-700 mb-1">
                  Especifique a Celebração
                </label>
                <input
                  type="text"
                  id="celebracao_extra"
                  name="celebracao_extra"
                  value={formData.celebracao_extra}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Salvar Decisão
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}