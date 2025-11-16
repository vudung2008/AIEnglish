interface Props {
    data: {
        key: string;
        mean: string;
        context: string;
        transContext: string;
    }
}

export const ContextCard = ({ data }: Props) => {
    return (
        <div className="p-4 border border-gray-300 rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1 bg-gray-50">
            <h3 className="font-semibold text-blue-600">{data.key} - {data.mean}</h3>
            <p className="text-gray-700 mt-2">{data.context}</p>
            <p className="text-gray-400 text-sm italic mt-1">{data.transContext}</p>
        </div>
    );
};
