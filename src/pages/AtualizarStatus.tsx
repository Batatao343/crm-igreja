import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader, ArrowLeft, Search, Save } from 'lucide-react';
import { Database } from '../lib/database.types';

type Decisao = Database['public']['Tables']['decisoes']['Row'];

const STATUS_OPTIONS = [
  'Contato realizado',
  'Em GDC',
  'Curso de batismo',
  'Aguardando contato'
] as const;

const AtualizarStatus: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decisoes, setDecisoes] = useState<Decisao[]>([]);
  const [selectedDecisao, setSelectedDecisao] = useState<Decisao | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('decisoes')
        .select('*')
        .ilike('nome', `%${searchTerm}%`)
        .order('data_decisao', { ascending: false });

      if (error) throw error;

      setDecisoes(data || []);
      if (data?.length === 0) {
        setError('Nenhuma decisão encontrada com este nome');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar decisões');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedDecisao || !newStatus) return;

    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('decisoes')
        .update({ status: newStatus })
        .eq('id', selectedDecisao.id);

      if (error) throw error;

      // Atualiza a lista local
      setDecisoes(decisoes.map(d => 
        d.id === selectedDecisao.id ? { ...d, status: newStatus } : d
      ));
      setSelectedDecisao(null);
      setNewStatus('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Atualizar Status</h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {decisoes.length > 0 && (
            <div className="space-y-4">
              {decisoes.map((decisao) => (
                <div
                  key={decisao.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedDecisao?.id === decisao.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => {
                    setSelectedDecisao(decisao);
                    setNewStatus(decisao.status || 'Aguardando contato');
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{decisao.nome}</h3>
                      <p className="text-sm text-gray-500">
                        Decisão: {decisao.decisao}
                      </p>
                    </div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      decisao.status === 'Contato realizado' ? 'bg-green-100 text-green-800' :
                      decisao.status === 'Em GDC' ? 'bg-blue-100 text-blue-800' :
                      decisao.status === 'Curso de batismo' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {decisao.status || 'Aguardando contato'}
                    </span>
                  </div>
                </div>
              ))}

              {selectedDecisao && (
                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="font-medium text-gray-900 mb-4">
                    Atualizar status para: {selectedDecisao.nome}
                  </h3>
                  <div className="space-y-4">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleStatusUpdate}
                      disabled={saving || newStatus === selectedDecisao.status}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader className="w-5 h-5 animate-spin mx-auto" />
                      ) : (
                        <div className="flex items-center justify-center">
                          <Save className="w-5 h-5 mr-2" />
                          Salvar Status
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AtualizarStatus; 