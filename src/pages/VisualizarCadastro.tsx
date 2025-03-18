import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader, ArrowLeft, Search, Eye } from 'lucide-react';
import { Database } from '../lib/database.types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Decisao = Database['public']['Tables']['decisoes']['Row'];

const VisualizarCadastro: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decisoes, setDecisoes] = useState<Decisao[]>([]);
  const [selectedDecisao, setSelectedDecisao] = useState<Decisao | null>(null);

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
            <h1 className="text-2xl font-bold text-gray-800">Visualizar Cadastro</h1>
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
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
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
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  onClick={() => setSelectedDecisao(decisao)}
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
                      decisao.status === 'Encaminhado para GDC' ? 'bg-blue-100 text-blue-800' :
                      decisao.status === 'Encaminhado para batismo' ? 'bg-purple-100 text-purple-800' :
                      decisao.status === 'Não retornou o contato' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {decisao.status || 'Aguardando contato'}
                    </span>
                  </div>
                </div>
              ))}

              {selectedDecisao && (
                <div className="mt-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Detalhes do Cadastro
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Informações Pessoais</h4>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Nome</dt>
                          <dd className="text-sm text-gray-900">{selectedDecisao.nome}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Data de Nascimento</dt>
                          <dd className="text-sm text-gray-900">
                            {selectedDecisao.nascimento ? format(new Date(selectedDecisao.nascimento), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Estado Civil</dt>
                          <dd className="text-sm text-gray-900">{selectedDecisao.estado_civil || '-'}</dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Informações de Contato</h4>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Email</dt>
                          <dd className="text-sm text-gray-900">{selectedDecisao.email || '-'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Celular</dt>
                          <dd className="text-sm text-gray-900">{selectedDecisao.celular || '-'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Cidade</dt>
                          <dd className="text-sm text-gray-900">{selectedDecisao.cidade || '-'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Estado</dt>
                          <dd className="text-sm text-gray-900">{selectedDecisao.estado || '-'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Bairro</dt>
                          <dd className="text-sm text-gray-900">{selectedDecisao.bairro || '-'}</dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Informações da Decisão</h4>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Decisão</dt>
                          <dd className="text-sm text-gray-900">{selectedDecisao.decisao}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Data da Decisão</dt>
                          <dd className="text-sm text-gray-900">
                            {format(new Date(selectedDecisao.data_decisao), 'dd/MM/yyyy', { locale: ptBR })}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Status</dt>
                          <dd className="text-sm text-gray-900">{selectedDecisao.status}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Deseja GDC</dt>
                          <dd className="text-sm text-gray-900">{selectedDecisao.deseja_gdc ? 'Sim' : 'Não'}</dd>
                        </div>
                        {selectedDecisao.deseja_gdc && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Encaminhado para o GDC</dt>
                            <dd className="text-sm text-gray-900">{selectedDecisao.gdc_encaminhado || '-'}</dd>
                          </div>
                        )}
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Nome do cadastrante</dt>
                          <dd className="text-sm text-gray-900">{selectedDecisao.nome_cadastrante}</dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Informações Adicionais</h4>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Celebração</dt>
                          <dd className="text-sm text-gray-900">
                            {selectedDecisao.celebracao}
                            {selectedDecisao.celebracao_extra && ` - ${selectedDecisao.celebracao_extra}`}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Observação</dt>
                          <dd className="text-sm text-gray-900 whitespace-pre-wrap">{selectedDecisao.observacao || '-'}</dd>
                        </div>
                      </dl>
                    </div>
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

export default VisualizarCadastro; 