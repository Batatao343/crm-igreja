import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader, Save, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

type DecisaoType = 'Aceitar Jesus' | 'Reconciliar com Cristo' | 'Batismo' | 'Quero GDC';
type EstadoCivilType = 'Solteiro' | 'Casado' | 'União Estável' | 'Divorciado' | 'Viúvo' | 'Noivo(a)' | 'Outro';
type CelebracaoType = 'Dominical' | 'Eleve' | 'Ignição' | 'Outros';
type StatusType = 'Contato realizado' | 'Aguardando contato' | 'Não retornou o contato' | 'Encaminhado para GDC' | 'Encaminhado para batismo';

const CadastroDecisao: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    decisao: '' as DecisaoType,
    data_decisao: format(new Date(), 'yyyy-MM-dd'),
    estado_civil: '' as EstadoCivilType,
    nascimento: '',
    email: '',
    cidade: '',
    estado: '',
    bairro: '',
    celular: '',
    celebracao: '' as CelebracaoType,
    celebracao_extra: '',
    status: 'Aguardando contato' as StatusType,
    deseja_gdc: false,
    observacao: '',
    gdc_encaminhado: '',
    nome_cadastrante: ''
  });

  const decisoes: DecisaoType[] = [
    'Aceitar Jesus',
    'Reconciliar com Cristo',
    'Batismo',
    'Quero GDC'
  ];

  const estados_civis: EstadoCivilType[] = [
    'Solteiro',
    'Casado',
    'União Estável',
    'Divorciado',
    'Viúvo',
    'Noivo(a)',
    'Outro'
  ];

  const celebracoes: CelebracaoType[] = [
    'Dominical',
    'Eleve',
    'Ignição',
    'Outros'
  ];

  const status_options: StatusType[] = [
    'Contato realizado',
    'Aguardando contato',
    'Não retornou o contato',
    'Encaminhado para GDC',
    'Encaminhado para batismo'
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
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
            user_id: user.id,
            cadastrado_por: user.id
          }
        ]);

      if (supabaseError) throw supabaseError;

      navigate('/dashboard');
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
            onClick={() => navigate('/dashboard')}
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
                Nome * <span className="text-red-500">*</span>
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
                Decisão <span className="text-red-500">*</span>
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
                Data da Decisão <span className="text-red-500">*</span>
              </label>
              <input
                required
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
                Estado Civil <span className="text-red-500">*</span>
              </label>
              <select
                required
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
                Data de Nascimento <span className="text-red-500">*</span>
              </label>
              <input
                required
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
                Celebração <span className="text-red-500">*</span>
              </label>
              <select
                required
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

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                required
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {status_options.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700">
                Deseja GDC
              </label>
              <div className="mt-1 space-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="deseja_gdc"
                    checked={formData.deseja_gdc === true}
                    onChange={() => setFormData({ ...formData, deseja_gdc: true })}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2">Sim</span>
                </label>
                <label className="inline-flex items-center ml-4">
                  <input
                    type="radio"
                    name="deseja_gdc"
                    checked={formData.deseja_gdc === false}
                    onChange={() => setFormData({ ...formData, deseja_gdc: false })}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2">Não</span>
                </label>
              </div>
            </div>

            {formData.deseja_gdc && (
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">
                  Encaminhado para o GDC:
                </label>
                <input
                  type="text"
                  name="gdc_encaminhado"
                  value={formData.gdc_encaminhado}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Nome do GDC"
                />
              </div>
            )}

            <div>
              <label htmlFor="observacao" className="block text-sm font-medium text-gray-700 mb-1">
                Observação
              </label>
              <textarea
                id="observacao"
                name="observacao"
                value={formData.observacao}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite aqui qualquer observação adicional..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do cadastrante <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nome_cadastrante"
                value={formData.nome_cadastrante}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-6">
            <p className="text-sm text-gray-500 italic">
              Campos marcados com <span className="text-red-500">*</span> são obrigatórios
            </p>
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
};

export default CadastroDecisao;