package com.atreyulibrary.seeder;

import com.atreyulibrary.book.Book;
import com.atreyulibrary.book.BookRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;

/**
 * Carga datos de muestra en la tabla de libros al iniciar en dev/qa.
 * Es idempotente: si los libros ya existen (constraint único en code), la excepción
 * se captura y se ignora sin interrumpir el arranque.
 */
@Component
@Profile({"dev", "qa", "e2e"})
@Order(2)
public class BookSeeder implements CommandLineRunner {

    private final BookRepository repository;

    /** Inyección por constructor. */
    public BookSeeder(final BookRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(final String... args) {
        try {
            repository.saveAll(buildSampleBooks());
        } catch (DataIntegrityViolationException ignored) {
            // Los libros ya fueron insertados por una instancia anterior o concurrente
        }
    }

    private List<Book> buildSampleBooks() {
        return List.of(
            book("A01", "Cien años de soledad", "Gabriel García Márquez", "Realismo mágico", 1967,
                "La saga de la familia Buendía a lo largo de siete generaciones en el mítico pueblo de Macondo. " +
                "Desde su fundación en medio de la selva hasta su apocalíptica destrucción, García Márquez teje " +
                "una historia donde lo maravilloso y lo cotidiano conviven sin fronteras, convirtiendo esta novela " +
                "en el emblema del realismo mágico latinoamericano y una de las obras más leídas del siglo XX."),

            book("A02", "El señor de los anillos", "J.R.R. Tolkien", "Fantasía", 1954,
                "El hobbit Frodo Bolsón hereda el Anillo Único, forjado por el Señor Oscuro Sauron para dominar " +
                "a todos los seres de la Tierra Media. Junto a la Comunidad del Anillo, emprende un viaje hacia " +
                "el corazón de Mordor para destruirlo en las llamas de la Montaña del Destino. Una epopeya de " +
                "amistad, sacrificio y la eterna lucha entre la luz y la oscuridad que definió la fantasía moderna."),

            book("A03", "1984", "George Orwell", "Distopía", 1949,
                "En la superpotencia totalitaria de Oceanía, el partido del Gran Hermano lo controla todo: " +
                "la historia, el lenguaje y hasta el pensamiento. Winston Smith, empleado del Ministerio de la " +
                "Verdad, comienza a guardar un diario prohibido y a cuestionar el orden establecido. Su acto de " +
                "rebelión interior, y el amor clandestino que encuentra, lo enfrentarán a la maquinaria más " +
                "implacable jamás imaginada. Una advertencia que sigue más vigente que nunca."),

            book("A04", "Don Quijote de la Mancha", "Miguel de Cervantes", "Novela", 1605,
                "Alonso Quijano, un hidalgo manchego enloquecido por las novelas de caballería, se convierte en " +
                "Don Quijote de la Mancha y sale al mundo a desfacer entuertos acompañado de su fiel escudero " +
                "Sancho Panza. Considerada la primera novela moderna, es un viaje por la ilusión y la realidad, " +
                "el idealismo y el pragmatismo, el humor y la melancolía de la condición humana."),

            book("A05", "Crimen y castigo", "Fiódor Dostoyevski", "Novela psicológica", 1866,
                "El estudiante Raskolnikov, convencido de que ciertos hombres superiores están por encima de la " +
                "ley moral, asesina a una vieja usurera. Pero el crimen, lejos de liberarlo, lo sume en un " +
                "tormento psicológico devastador. A través de un magistral duelo intelectual con el inspector " +
                "Porfiry, Dostoyevski explora la culpa, la redención y los límites del racionalismo humano."),

            book("A06", "El principito", "Antoine de Saint-Exupéry", "Fábula", 1943,
                "Un aviador perdido en el desierto del Sahara conoce a un niño llegado de un asteroide lejano. " +
                "A través de sus encuentros con un rey, un vanidoso, un bebedor y un hombre de negocios, el " +
                "principito aprende sobre la amistad, el amor, la pérdida y lo que realmente importa en la vida. " +
                "Una fábula filosófica que habla a los adultos con la voz de la infancia."),

            book("A07", "Orgullo y prejuicio", "Jane Austen", "Romance", 1813,
                "Elizabeth Bennet, inteligente y de carácter independiente, y el orgulloso señor Darcy se " +
                "desagradan profundamente en su primer encuentro. Pero las circunstancias, los malentendidos " +
                "y la agudeza de ambos los irán acercando. Una novela brillante sobre los prejuicios de clase, " +
                "el matrimonio y la búsqueda de la felicidad genuina en la Inglaterra de principios del siglo XIX."),

            book("A08", "Moby Dick", "Herman Melville", "Aventura", 1851,
                "El capitán Ahab conduce el ballenero Pequod en una cacería obsesiva de la ballena blanca que le " +
                "arrancó una pierna. Ishmael, el narrador, observa cómo esa fijación desmedida arrastra a toda " +
                "la tripulación hacia un destino trágico. Una novela sobre la obsesión, el destino y la " +
                "imposibilidad de doblegar las fuerzas de la naturaleza, considerada la gran novela americana."),

            book("A09", "La odisea", "Homero", "Épica", null,
                "Tras la caída de Troya, el astuto Odiseo emprende un viaje de regreso a Ítaca que se " +
                "prolongará diez años. Cíclopes, sirenas, hechiceras, tormentas y la cólera de Poseidón " +
                "ponen a prueba su ingenio y su resistencia. Mientras tanto, su esposa Penélope aguarda " +
                "y su hijo Telémaco crece. El poema fundacional de la literatura occidental."),

            book("A10", "Frankenstein", "Mary Shelley", "Terror", 1818,
                "El joven científico Victor Frankenstein, obsesionado con vencer a la muerte, crea vida a " +
                "partir de materia inerte. Pero la criatura, inteligente y sensible, es rechazada por todos " +
                "los que la miran. Su soledad se convierte en rabia y su rabia en venganza. Una novela que " +
                "fundó la ciencia ficción y plantea preguntas éticas sobre la responsabilidad del creador " +
                "frente a su creación que resuenan hasta hoy."),

            book("B01", "El retrato de Dorian Gray", "Oscar Wilde", "Novela filosófica", 1890,
                "El joven Dorian Gray, seducido por la filosofía hedonista de Lord Henry Wotton, desea que " +
                "su retrato envejezca en su lugar mientras él conserva la juventud eternamente. Su deseo se " +
                "cumple: mientras el cuadro registra cada pecado y cada año, Dorian permanece bello e " +
                "impasible. Un estudio elegante y perturbador sobre la vanidad, la corrupción moral y el " +
                "precio de una vida vivida solo para el placer."),

            book("B02", "Ulises", "James Joyce", "Modernismo", 1922,
                "Durante un único día en Dublín, el 16 de junio de 1904, Leopold Bloom recorre la ciudad " +
                "mientras su mente fluye libremente entre recuerdos, deseos y reflexiones. Paralela y " +
                "entretejida, la jornada de Stephen Dedalus y el monólogo interior de Molly Bloom completan " +
                "esta reescritura moderna de La Odisea. Una revolución en la forma de narrar que redefinió " +
                "las posibilidades de la novela del siglo XX."),

            book("B03", "En busca del tiempo perdido", "Marcel Proust", "Novela", 1913,
                "El narrador Marcel recorre su vida entera a través de la memoria involuntaria, esa memoria " +
                "que despiertan las sensaciones: el sabor de una magdalena, el olor a humedad, una melodía " +
                "escuchada al pasar. A lo largo de siete volúmenes, Proust construye una catedral literaria " +
                "sobre el tiempo, el arte, los celos y la sociedad francesa de la Belle Époque. La novela " +
                "más extensa y ambiciosa de la literatura occidental."),

            book("B04", "La metamorfosis", "Franz Kafka", "Surrealismo", 1915,
                "Gregor Samsa, viajante de comercio que sostiene económicamente a su familia, amanece un día " +
                "convertido en un enorme insecto. La novela no explica el prodigio: simplemente lo acepta " +
                "y sigue sus consecuencias. La familia pasa de la compasión al hastío y al rechazo, mientras " +
                "Gregor se desvanece. Una alegoría sobre la alienación, la culpa y la deshumanización que " +
                "define la modernidad kafkiana."),

            book("B05", "El gran Gatsby", "F. Scott Fitzgerald", "Novela", 1925,
                "En los dorados años veinte, Jay Gatsby organiza fastuosas fiestas en su mansión de Long " +
                "Island con un único propósito: reconquistar el amor perdido de Daisy Buchanan. Nick " +
                "Carraway, narrador y vecino, observa cómo la obsesión de Gatsby choca contra la frivolidad " +
                "de la clase alta y la corrupción del sueño americano. Un retrato del desencanto que " +
                "define una era y una nación.")
        );
    }

    private Book book(
            final String code,
            final String title,
            final String author,
            final String genre,
            final Integer year,
            final String synopsis
    ) {
        return Book.builder()
                .code(code)
                .title(title)
                .author(author)
                .genre(genre)
                .publicationYear(year)
                .synopsis(synopsis)
                .build();
    }
}
