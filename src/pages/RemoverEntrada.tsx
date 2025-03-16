import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader, ArrowLeft, Search, Trash2, AlertTriangle } from 'lucide-react';
import { Database } from '../lib/database.types';

type Decisao = Database['public']['Tables']['decisoes']['Row'];

const RemoverEntrada: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decisoes, setDecisoes] = useState<Decisao[]>([]);
  const [selectedDecisao, setSelectedDecisao] = useState<Decisao | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setSelectedDecisao(null);
    setConfirmDelete(false);

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

  const handleDelete = async () => {
    if (!selectedDecisao || !confirmDelete) return;

    setDeleting(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('decisoes')
        .delete()
        .eq('id', selectedDecisao.id);

      if (error) throw error;

      // Atualiza a lista local
      setDecisoes(decisoes.filter(d => d.id !== selectedDecisao.id));
      setSelectedDecisao(null);
      setConfirmDelete(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover entrada');
    } finally {
      setDeleting(false);
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
            <h1 className="text-2xl font-bold text-gray-800">Remover Entrada</h1>
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
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
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
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                  onClick={() => {
                    setSelectedDecisao(decisao);
                    setConfirmDelete(false);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{decisao.nome}</h3>
                      <p className="text-sm text-gray-500">
                        Decisão: {decisao.decisao}
                      </p>
                      <p className="text-sm text-gray-500">
                        Status: {decisao.status || 'Aguardando contato'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {selectedDecisao && (
                <div className="mt-6 p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center mb-4 text-red-700">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <h3 className="font-medium">
                      Confirmar remoção para: {selectedDecisao.nome}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Esta ação não pode ser desfeita. Todos os dados desta entrada serão permanentemente removidos.
                  </p>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={confirmDelete}
                        onChange={(e) => setConfirmDelete(e.target.checked)}
                        className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Sim, tenho certeza que desejo remover esta entrada
                      </span>
                    </label>
                    <button
                      onClick={handleDelete}
                      disabled={deleting || !confirmDelete}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {deleting ? (
                        <Loader className="w-5 h-5 animate-spin mx-auto" />
                      ) : (
                        <div className="flex items-center justify-center">
                          <Trash2 className="w-5 h-5 mr-2" />
                          Remover Entrada
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

export default RemoverEntrada; 