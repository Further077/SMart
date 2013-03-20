import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;
import java.util.HashMap;
import java.util.Map;


public class ParseTxt {
	static String year = "2001";

	public static void main(String[] args) throws IOException{
		HashMap<Integer, Integer> map = new HashMap<Integer,Integer>();
		BufferedReader br = new BufferedReader(new FileReader("C:\\Users\\mtk\\Documents\\comp441\\"+ year + ".txt"));
		int count = 0;
		try {
			StringBuilder sb = new StringBuilder();
			String line = br.readLine();
			
			while (line != null ) {
				count++;
				int ward = Integer.parseInt(line.replaceAll("[\\D]", ""));
				//int ward = Integer.parseInt(line);
				if (!map.containsKey(ward)){
					map.put(ward, 1);
				} else{
					int increment = map.get(ward) + 1;
					map.put(ward, increment);
				}
				line = br.readLine();
			}
		} catch (Exception e){
			System.out.println(count);
		}
		finally {
			br.close();
		}

		//createTXT(map);
		createJSON(map);
		
	}
	
	public static void createTXT(HashMap<Integer, Integer> map) throws IOException{
		Writer output = null;
		File file = new File("C:\\Users\\mtk\\Documents\\comp441\\2001crimes.txt");
		output = new BufferedWriter(new FileWriter(file));
		for (Map.Entry entry : map.entrySet()) {
			try {
				output.write("[" + entry.getKey() + "," + entry.getValue() + "]");
				output.write(System.getProperty("line.separator"));
			} catch (IOException e) {
				e.printStackTrace();
			}
			
		}
		output.close();
	}

	public static void createJSON(HashMap<Integer, Integer> map) throws IOException{
		Writer output = null;
		File file = new File("C:\\Users\\mtk\\Documents\\comp441\\crimes" + year + ".json");
		output = new BufferedWriter(new FileWriter(file));
		output.write("{\"items\":[");
		for (Map.Entry entry : map.entrySet()) {
			
			if ((int) entry.getKey() < 10){
				output.write("{\"title\":\"Ward " + entry.getKey() + "\"," +
						"\"url\":\"http:\\/\\/www.cityofchicago.org\\/city\\/en\\/about\\/wards\\/0"
						+ entry.getKey() + ".html\",\"score\":\"" + entry.getValue() + " crimes\"" +
								",\"description\":\"Ward " + entry.getKey() + " had " + entry.getValue() + " crimes\"},");
			} else {
				output.write("{\"title\":\"Ward " + entry.getKey() + "\"," +
						"\"url\":\"http:\\/\\/www.cityofchicago.org\\/city\\/en\\/about\\/wards\\/"
						+ entry.getKey() + ".html\",\"score\":\"" + entry.getValue() + " crimes\"" +
								",\"description\":\"Ward " + entry.getKey() + " had " + entry.getValue() + " crimes\"},");
			}
		}
		output.write("]}");
		output.close();
	}
	
}
