
type_mapping = {

	int:   'INT',
	str:   'TEXT',
	float: 'DOUBLE',

}

def T(t):
	return type_mapping[t] if type(t) is type else t